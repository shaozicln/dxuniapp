<script>
	export default {
		data() {
			return {
				// 标记：是否已完成首次登录态检查（防止 onShow 重复触发）
				hasInitedLoginCheck: false,
				PAGE_PATHS: {
					LOGIN: '/pages/login/login', 
					INDEX: '/pages/index/index',
					MY: '/pages/my/my'
				},
				AUTHORIZED_PAGES: [] // 初始为空，在 onLaunch 中初始化
			}
		},
		onLaunch: function() {
			console.log('App Launch');
			// 初始化已授权页面白名单（使用统一路径配置，避免错误）
			this.AUTHORIZED_PAGES = [
				this.PAGE_PATHS.INDEX,
				this.PAGE_PATHS.MY
			];
			setTimeout(() => {
				this.checkOpenidStatus();
				this.hasInitedLoginCheck = true;
			}, 300);
		},
		onShow: function() {
			console.log('App Show');
			// 控制 onShow 触发时机：仅在“首次检查未完成”或“从后台切回且登录态可能变化”时执行
			if (!this.hasInitedLoginCheck) {
				this.checkOpenidStatus();
				this.hasInitedLoginCheck = true;
			} else {
				// 场景2：从后台切回，仅在“登录态存在变化风险”时检查（如用户可能在其他端登出）
				// 优化：可增加“切后台时间判断”，超过 30 分钟才重新检查（避免频繁执行）
				const lastHideTime = this.$options.globalData.lastHideTime || 0;
				const currentTime = Date.now();
				if (currentTime - lastHideTime > 30 * 60 * 1000) { // 30分钟
					this.checkOpenidStatus();
				}
			}
		},
		onHide: function() {
			console.log('App Hide');
			// 记录切后台时间（用于 onShow 时判断是否需要重新检查登录态）
			this.$options.globalData.lastHideTime = Date.now();
		},
		methods: {
			// 封装：检查 openid 登录态 + 控制跳转（核心优化）
			checkOpenidStatus() {
				// 1. 读取 openid（增加异常捕获，避免存储读取失败导致逻辑中断）
				let openid = '';
				try {
					openid = uni.getStorageSync('openid') || '';
				} catch (err) {
					console.error('读取 openid 失败：', err);
					openid = '';
				}
				const pages = getCurrentPages();
				const currentPage = pages.length > 0 ? pages[pages.length - 1].route : '';
				const currentPageWithPrefix = currentPage ? `/${currentPage}` : '';
				console.log('当前页面路径：', currentPageWithPrefix);
				// 登录态判断 + 跳转控制（核心逻辑：仅在“当前页不符合权限”时跳转）
				if (openid) {
					// 已登录：判断当前页是否在授权白名单内
					if (!this.AUTHORIZED_PAGES.includes(currentPageWithPrefix)) {
						// 未在白名单 → 跳首页（避免重复跳转：先判断是否已在首页）
						if (currentPageWithPrefix !== this.PAGE_PATHS.INDEX) {
							this.redirectToPage(this.PAGE_PATHS.INDEX, '首页');
						}
					}
				} else {
					if (currentPageWithPrefix !== this.PAGE_PATHS.LOGIN) {
						this.redirectToPage(this.PAGE_PATHS.LOGIN, '登录页');
					}
				}
			},
			// 封装：统一跳转方法
			redirectToPage(targetPath, pageName) {
				// 先校验目标路径是否存在
				const pagesConfig = uni.getAppBaseInfo().pages || [];
				const isPathValid = pagesConfig.some(page => page.path === targetPath.slice(1)); 
				if (!isPathValid) {
					console.error(`跳转失败：${pageName}路径${targetPath}未在 pages.json 中注册`);
					return;
				}
				// 执行跳转（用 redirectTo 关闭当前页，防止返回无效页面）
				uni.redirectTo({
					url: targetPath,
					success: () => {
						console.log(`跳转${pageName}成功`);
					},
					fail: (err) => {
						// 特殊处理：若目标是 tabbar 页，redirectTo 会失败，自动切换为 switchTab
						if (err.errMsg.includes('can not redirectTo a tabbar page')) {
							console.warn(`(${pageName}是 tabbar 页) 自动切换为 switchTab 跳转`);
							uni.switchTab({
								url: targetPath,
								success: () => console.log(`switchTab 跳转${pageName}成功`),
								fail: (tabErr) => console.error(`switchTab 跳转${pageName}失败：`, tabErr)
							});
						} else {
							console.error(`跳转${pageName}失败：`, err);
						}
					}
				});
			}
		},
		// 全局数据：存储切后台时间（跨生命周期访问）
		globalData: {
			lastHideTime: 0
		}
	}
</script>

<style>
	body {
		margin: 0;
		padding: 0;
	}
</style>