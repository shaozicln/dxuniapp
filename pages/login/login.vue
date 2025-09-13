<template>
	<view class="login-container">
		<view class="form-box" v-if="showLoginForm">
			<view class="title">{{ form.userID ? '欢迎回来' : '请登录' }}</view>
			<input class="input" placeholder="请输入教工号/学工号(例：Z10005)" @input="form.userID = $event.detail.value.trim()"
				:value="form.userID" :disabled="isLoading" />
			<input class="input" placeholder="请输入姓名" @input="form.name = $event.detail.value.trim()" :value="form.name"
				:disabled="isLoading" />
			<button class="main-btn" @tap="handleLogin" :disabled="!form.userID || !form.name || isLoading">
				{{ isLoading ? '登录中...' : '请点击登录' }}
			</button>
		</view>
		<view class="campus-net-tip">若无法登录，请检查是否连接校园网</view>
		<view class="loading-box" v-if="isLoading && !showLoginForm">
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
	} from '/utils/request/request'
	import {
		loginMsgUtil
	} from '/utils/login/msgUtil'
	import {
		loginFlowUtil
	} from '/utils/login/flowUtil'
	import {
		loginStorageUtil
	} from '/utils/login/storageUtil'
	import {
		getInfo
	} from '/utils/login/getInfo.js'

	export default {
		data() {
			console.log('登录页组件初始化 - data数据初始化完成')
			return {
				showLoginForm: false,
				form: {
					userID: '',
					name: ''
				},
				msg: '',
				msgType: '',
				isLoading: false,
				msgTimer: null
			};
		},

		onLoad() {
			console.log('登录页onLoad生命周期触发 - 开始执行初始化逻辑')
			this.initLoginFlow()
		},

		methods: {
			async initLoginFlow() {
				console.log('进入initLoginFlow - 启动自动登录流程')
				this.isLoading = true
				try {
					const wxCode = await loginFlowUtil.getWxCode();
					console.log('自动获取微信code成功:', wxCode)

					const {
						autoLoginRes,
						userID
					} = await loginFlowUtil.autoLogin(wxCode);

					if (autoLoginRes?.token && userID) {
						console.log('后端获取成功，成功获取到用户信息', {
							token: autoLoginRes.token
						})
						const userInfo = loginStorageUtil.buildUserInfo(
							userID,
							autoLoginRes.name,
							autoLoginRes.token,
						);
						loginStorageUtil.saveAutoLoginData(autoLoginRes.token, userInfo);
						// 调用 getInfo 获取身份：确保 await 等待完成后再执行后续逻辑
						console.log('自动登录成功，开始获取用户身份信息')
						await getInfo._handleGetInfoRequest(() => {
							this.showLoginForm = true;
							loginMsgUtil.showMsg(this, '身份验证失败，请重新登录', 'error');
						});

						loginMsgUtil.showMsg(this, '自动登录成功，正在跳转', 'success');
					} else if (autoLoginRes?.token) {
						console.log('自动登录仅获取到token，缺少用户信息')
						loginStorageUtil.saveAutoLoginData(autoLoginRes.token);
						loginMsgUtil.showMsg(this, '需补充用户信息，请手动登录', 'error');
					} else {
						console.log('自动登录失败，未获取到有效token')
						loginMsgUtil.showMsg(this, '自动登录失败，请手动登录', 'error');
					}

				} catch (err) {
					console.error('login.vue文件下initLoginFlow函数方法调用异常，自动登录流程响应失败:', {
						errMsg: err.message,
						stack: err.stack
					})
					loginMsgUtil.showMsg(this, `自动登录失败: ${err.message || '网络异常'}`, 'error');
				} finally {
					await this.checkLocalToken()
					this.isLoading = false
					console.log('自动登录流程结束，已执行本地Token校验')
				}
			},

			async checkLocalToken() {
				console.log('进入checkLocalToken - 校验本地登录状态')
				this.isLoading = true
				try {
					const {
						localAutoToken,
						localManualToken,
						localUser
					} = loginStorageUtil.getLocalLoginData();
					console.log('本地存储数据校验:', {
						hasAutoToken: !!localAutoToken,
						hasManualToken: !!localManualToken,
						hasUserInfo: !!localUser,
						userID: localUser?.userID || '无',
						userIdentity: localUser?.userIdentity || '未获取' 
					})
					let completeUser = {
						...localUser
					};
					if (!completeUser.userIdentity) {
						completeUser.userIdentity = completeUser.teacherID?.startsWith('Z') ?
							'教师' :
							(completeUser.studentID ? '学生' : '未登录');
						uni.setStorageSync('userInfo', completeUser);
					}
					// 判定登录状态：身份有效性判断
					const hasValidToken = localAutoToken || localManualToken;
					const hasCompleteUser = completeUser?.userID && completeUser?.userIdentity; 

					if (hasValidToken && hasCompleteUser) {
						console.log('本地登录状态有效，跳转首页', {
							userIdentity: completeUser.userIdentity
						})
						setTimeout(() => {
							uni.setStorageSync('isLogin', true)
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1000)
					} else {
						console.log('本地登录状态无效（缺Token或身份），显示登录表单')
						this.showLoginForm = true
					}

				} catch (err) {
					console.error('本地Token校验异常:', {
						errMsg: err.message,
						stack: err.stack
					})
					loginMsgUtil.showMsg(this, '登录状态校验失败，请重试', 'error');
					this.showLoginForm = true
				} finally {
					this.isLoading = false
					console.log('localToken校验流程结束')
				},

			async handleLogin() {
				console.log('进入handleLogin - 执行手动登录')
				this.isLoading = true
				try {
					const {
						trimmedUserID,
						trimmedName
					} = loginFlowUtil.validateInput(
						this.form.userID,
						this.form.name
					);

					const wxCode = await loginFlowUtil.getWxCode();
					const loginRes = await loginFlowUtil.manualLogin(wxCode, trimmedUserID);

					if (loginRes?.token) {
						console.log('手动登录成功，获取到token:', loginRes.token)
						const userInfo = loginStorageUtil.buildUserInfo(
							trimmedUserID,
							trimmedName,
							loginRes.token,
							''
						);
						loginStorageUtil.saveManualLoginData(loginRes.token, userInfo);
						// 调用 getInfo 获取身份：等待完成后再跳转
						console.log('手动登录成功，开始获取用户身份信息')
						await getInfo._handleGetInfoRequest(() => {
							this.showLoginForm = true;
							loginMsgUtil.showMsg(this, '身份验证失败，请重新登录', 'error');
						});

						loginMsgUtil.showMsg(this, '登录成功，正在跳转', 'success');
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}, 1000)
					} else {
						throw new Error(loginRes?.msg || '登录失败，请检查账号信息是否正确')
					}

				} catch (err) {
					console.error('手动登录异常:', {
						errMsg: err.message,
						stack: err.stack
					})
					loginMsgUtil.showMsg(this, err.message || '登录异常，请重试', 'error');
				} finally {
					this.isLoading = false
				}
			}
		},

		onUnload() {
			console.log('登录页onUnload生命周期触发')
			loginMsgUtil.clearMsgTimer(this);
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
		/* 补充完整：原代码截断为"max-width: 5"，此处修正为500rpx，与表单宽度一致 */
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