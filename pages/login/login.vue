<template>
	<view class="login-container">
		<view class="form-box" v-if="showLoginForm">
			<view class="title">{{ form.teacherId ? '欢迎回来' : '请登录' }}</view>
			<input class="input" placeholder="请输入教工号/学工号(例：Z10005)" @input="form.teacherId = $event.detail.value.trim()"
				:value="form.teacherId" :disabled="isLoading" />
			<input class="input" placeholder="请输入姓名" @input="form.name = $event.detail.value.trim()" :value="form.name"
				:disabled="isLoading" />
			<button class="main-btn" @tap="handleLogin" :disabled="!form.teacherId || !form.name || isLoading">
				{{ isLoading ? '登录中...' : '请点击登录' }}
			</button>
		</view>
		<view class="campus-net-tip">若无法登录，请检查是否连接校园网</view>
		<!-- 加载提示（Token校验/登录过程中显示） -->
		<view class="loading-box" v-if="isLoading && !showLoginForm">
			<!-- uni-app内置loading组件（兼容多端） -->
			<uni-loading type="spin" size="36"></uni-loading>
			<view class="loading-text">正在验证登录状态...</view>
		</view>
		<view class="msg" :class="msgType === 'error' ? 'error-msg' : 'success-msg'" v-if="msg">
			{{ msg }}
		</view>
	</view>
</template>

<script>
	import {
		get,
		post
	} from '/src/utils/request/request'
	export default {
		data() {
			console.log('登录页组件初始化 - data数据初始化完成')
			return {
				showLoginForm: false, // 是否显示登录表单
				form: {
					teacherId: '', // 教工号/学工号
					name: '' // 姓名
				},
				msg: '', // 提示消息
				msgType: '', // 消息类型：error/success
				isLoading: false, // 加载状态
				msgTimer: null // 消息定时器（防止重复触发）
			};
		},

		onLoad() {
			console.log('登录页onLoad生命周期触发 - 开始执行初始化逻辑')
			// 一进入页面就执行「自动获取code+请求token」+「本地Token校验」
			this.initLoginFlow()
		},

		methods: {
			showMsg(message, type = 'error') {
				console.log(`[消息提示] 类型: ${type}, 内容: ${message}`)
				if (this.msgTimer) {
					clearTimeout(this.msgTimer)
				}
				this.msg = message
				this.msgType = type
				this.msgTimer = setTimeout(() => {
					console.log('消息提示自动关闭')
					this.msg = ''
				}, 5000)
			},

			/**
			 * 先自动调用微信登录获取code，请求后端/loginByCode获取token
			 * 再校验本地Token，决定是否显示登录表单
			 */
			async initLoginFlow() {
				console.log('进入initLoginFlow - 启动自动登录流程（获取code+请求token）')
				this.isLoading = true
				try {
					// 自动获取微信登录code（无需用户操作）
					const wxLoginRes = await new Promise((resolve, reject) => {
						uni.login({
							provider: 'weixin',
							success: (res) => {
								if (res.code) {
									console.log('自动获取微信code成功:', res.code)
									resolve(res.code)
								} else {
									reject(new Error(`自动获取code失败: ${res.errMsg}`))
								}
							},
							fail: (err) => {
								reject(new Error(`微信登录接口调用失败: ${err.errMsg}`))
							}
						})
					})

					// 自动调用后端/loginByCode，传递code获取token
					console.log('自动调用后端/loginByCode接口，传递code请求token')
					// const autoLoginRes = await post('https://jxpj.neau.edu.cn/api/v1/loginByCode', {
					const autoLoginRes = await post('http://localhost:8080/loginByCode', {
						weixincode: wxLoginRes, // 传递自动获取的微信code
					})

					// 若自动获取token成功，先存储到本地
					if (autoLoginRes?.token) {
						console.log('自动登录成功，获取到token:', autoLoginRes.token)
						// 存储自动获取的token（若后端返回openid也一并存储）
						uni.setStorageSync('autoToken', autoLoginRes.token)
						this.showMsg('自动获取登录凭证成功', 'success')
					} else {
						console.log('自动登录未获取到有效token，需后续用户手动登录')
						this.showMsg('未获取到相关信息，请手动登录', 'error')
					}

				} catch (err) {
					console.error('自动登录流程异常:', err)
					this.showMsg('自动登录失败，请重试', 'error')
				} finally {
					// 无论自动登录成功与否，都校验本地Token（决定是否显示表单）
					await this.checkLocalToken()
					this.isLoading = false
					console.log('自动登录流程完成，进入本地Token校验阶段')
				}
			},

			// 校验本地Token：有则直接跳转，无则显示登录表单（逻辑保留，增加兼容性）
			async checkLocalToken() {
				console.log('进入checkLocalToken方法 - 开始校验本地登录状态')
				this.isLoading = true
				try {
					// 关键修改2：同时校验「自动登录的token」和「手动登录的token」
					const localAutoToken = uni.getStorageSync('autoToken') // 自动登录的token
					const localManualToken = uni.getStorageSync('token') // 手动登录的token
					const localUser = uni.getStorageSync('userInfo')

					console.log('从本地存储获取数据:', {
						hasAutoToken: !!localAutoToken,
						hasManualToken: !!localManualToken,
						hasUserInfo: !!localUser
					})

					// 有任意有效token+完整用户信息 → 直接跳首页
					if ((localAutoToken || localManualToken) && localUser?.teacherId) {
						console.log('本地验证通过: 存在有效Token和完整用户信息')
						this.showMsg('已登录，正在跳转', 'success')
						setTimeout(() => {
							uni.setStorageSync('isLogin', true)
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1000)
					} else {
						// 无有效token/用户信息 → 显示登录表单
						console.log('本地无有效Token，需要用户手动登录')
						this.showLoginForm = true
					}

				} catch (err) {
					console.error('Token校验过程发生异常:', err)
					this.showMsg('登录状态校验异常，请重试')
					this.showLoginForm = true
				} finally {
					this.isLoading = false
					console.log('checkLocalToken方法执行完成')
				}
			},

			/**
			 * 用户手动登录逻辑（保留原功能，兼容用户手动输入信息的场景）
			 */
			async handleLogin() {
				console.log('进入handleLogin方法 - 执行用户手动登录逻辑')
				this.isLoading = true
				try {
					//  校验用户输入（教工号/姓名不能为空）
					if (!this.form.teacherId.trim() || !this.form.name.trim()) {
						throw new Error('请输入完整的教工号和姓名')
					}

					// 获取微信code
					const wxLoginRes = await new Promise((resolve, reject) => {
						uni.login({
							provider: 'weixin',
							success: (res) => res.code ? resolve(res.code) : reject(new Error(
								`获取code失败: ${res.errMsg}`)),
							fail: (err) => reject(new Error(`微信登录接口失败: ${err.errMsg}`))
						})
					})

					// 调用后端/loginByCode（传递code+用户信息，获取最终token）
					// const loginRes = await post('https://jxpj.neau.edu.cn/api/v1/login', {
					const loginRes = await post('http://127.0.0.1:8080/login', {
						weixincode: wxLoginRes,
						username: this.form.teacherId.trim(),
						password: this.form.teacherId.trim()
					})

					//处理手动登录结果
					if (loginRes?.token) {
						console.log('手动登录成功，获取到token:', loginRes.token)
						// 构造完整用户信息
						const userInfo = {
							teacherId: this.form.teacherId.trim(),
							name: this.form.name.trim(),
							loginTime: new Date().toLocaleString(),
							token: loginRes.token,
						}

						// 存储手动登录的信息（覆盖自动登录的临时token）
						uni.setStorageSync('token', loginRes.token)
						uni.setStorageSync('userInfo', userInfo)
						uni.setStorageSync('isLogin', true)

						this.showMsg('登录成功，即将跳转', 'success')
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1000)

					} else {
						const errorMsg = loginRes?.msg || '登录失败，请检查教工号和姓名'
						throw new Error(errorMsg)
					}

				} catch (err) {
					console.error('手动登录异常:', err)
					this.showMsg(err.message || '登录异常，请重试')
				} finally {
					this.isLoading = false
				}
			}

		},

		onUnload() {
			console.log('登录页onUnload生命周期触发')
			if (this.msgTimer) {
				clearTimeout(this.msgTimer)
			}
		}
	};
</script>
<style scoped>
	.login-container {
		padding: 40rpx 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 60rpx;
		background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
		min-height: 100vh;
		width: 100%;
	}


	.form-box {
		width: 100%;
		max-width: 500rpx;
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		background: #fff;
		padding: 60rpx 40rpx;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 123, 255, 0.1);
	}

	.loading-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		color: #409eff;
		font-size: 28rpx;
	}

	/* 标题样式 */
	.title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		text-align: center;
		margin-bottom: 20rpx;
	}

	/* 提示文本样式 */
	.tip {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		margin-bottom: 10rpx;
		line-height: 1.5;
	}

	/* 输入框样式 */
	.input {
		width: 95%;
		height: 80rpx;
		border: 1px solid #dcdcdc;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		transition: all 0.3s ease;
	}

	/* 输入框聚焦样式 */
	.input:focus {
		border-color: #409eff;
		box-shadow: 0 0 0 2rpx rgba(64, 158, 255, 0.2);
		outline: none;
	}

	/* 输入框禁用样式 */
	.input:disabled {
		background-color: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	/* 主按钮样式 */
	.main-btn {
		height: 90rpx;
		font-size: 32rpx;
		border-radius: 45rpx;
		background: linear-gradient(90deg, #409eff, #66b1ff);
		color: #fff;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20rpx;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	/* 按钮禁用样式 */
	.main-btn[disabled] {
		background: #c6e2ff;
		cursor: not-allowed;
	}

	/* 消息提示基础样式 */
	.msg {
		font-size: 26rpx;
		text-align: center;
		margin-top: 20rpx;
		padding: 16rpx 20rpx;
		border-radius: 10rpx;
		width: 100%;
		max-width: 500rpx;
	}

	/* 错误消息样式 */
	.error-msg {
		color: #f56c6c;
		background: rgba(245, 108, 108, 0.1);
		border: 1px solid #fde2e2;
	}

	/* 成功消息样式 */
	.success-msg {
		color: #67c23a;
		background: rgba(103, 194, 58, 0.1);
		border: 1px solid #e1f3d8;
	}

	/* 校园网提示样式 */
	.campus-net-tip {
		font-size: 30rpx;
		color: #666;
		text-align: center;
		padding: 10rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		margin-top: 10rpx;
	}
</style>