<template>
	<view class="questionnaire-detail-page">
		<!-- 顶部导航栏 -->
		<view class="page-header" v-if="questionnaire">
			<view class="back-button" @click="handleBack">
				<text class="back-icon">←</text>
			</view>
			<view class="header-title">{{ questionnaire.title }}</view>
		</view>

		<!-- 加载中状态 -->
		<view class="loading-state" v-else>
			<text>加载中...</text>
		</view>

		<!-- 问卷内容区域 -->
		<view class="questionnaire-content" v-if="questionnaire">
			<view class="question-item" v-for="(question, qIndex) in questionnaire.questions" :key="qIndex">
				<view class="question-number">{{ qIndex + 1 }}.</view>
				<view class="question-text">{{ question.text }}</view>

				<!-- 四种题型区分渲染 -->
				<view class="question-options">
					<!-- 1. 单选（圆圈） -->
					<view v-if="question.type === 'single'" class="options-single">
						<view class="option-single" v-for="(option, oIndex) in question.options" :key="oIndex"
							:class="{ selected: isOptionSelected(question.id, option.id) }"
							@click="selectOption(question.id, option.id)">
							<view class="radio-marker">
								<view class="radio-dot" v-if="isOptionSelected(question.id, option.id)"></view>
							</view>
							<text>{{ option.text }}</text>
						</view>
					</view>

					<!-- 2. 多选（方块） -->
					<view v-if="question.type === 'multiple'" class="options-multiple">
						<view class="option-multiple" v-for="(option, oIndex) in question.options" :key="oIndex"
							:class="{ selected: isOptionSelected(question.id, option.id) }"
							@click="selectOption(question.id, option.id)">
							<view class="checkbox-marker">
								<text class="check-icon" v-if="isOptionSelected(question.id, option.id)">✓</text>
							</view>
							<text>{{ option.text }}</text>
						</view>
					</view>

					<!-- 3. 星级评分（打星） -->
					<view v-if="question.type === 'rating'" class="options-rating">
						<view class="star-item" v-for="star in 5" :key="star"
							:class="{ selected: question.answer !== null && star <= question.answer }"
							@click="selectStar(question.id, star)">
							★
							<view class="star-text">{{ getStarScore(star) }}分</view>
						</view>
					</view>

					<!-- 4. 滑动条打分（重点修复） -->
					<view v-if="question.type === 'slider'" class="options-slider">
						<view class="slider-container">
							<!-- 滑动提示气泡 -->
							<view class="slider-tooltip-wrapper" :style="{ left: getSliderPosition(question) }">
								<view class="slider-tooltip">{{ question.answer }}分</view>
								<view class="tooltip-arrow"></view>
							</view>

							<!-- 滑块组件 -->
							<slider :min="1" :max="10" :step="1" :value="question.answer || 1"
								@changing="handleSliderChanging(question.id, $event)"
								@change="handleSliderChange(question.id, $event)" activeColor="#42b983"
								backgroundColor="#eaeaea" block-size="32rpx" block-color="#42b983"
								block-border-radius="50%"></slider>
						</view>

						<!-- 滑动条两端标签 -->
						<view class="slider-labels">
							<text>1分</text>
							<text>10分</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作区 -->
		<view class="bottom-actions" v-if="questionnaire">
			<view class="reset-btn" v-if="questionnaire.status === 'completed'" @click="resetQuestionnaire">
				重新填写
			</view>
			<button class="submit-btn" v-if="questionnaire.status !== 'completed'" @click="submitQuestionnaire">
				提交问卷
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';

	const questionnaire = ref(null);

	onMounted(() => {
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const data = currentPage.options.data;
		if (data) {
			// 解析问卷数据
			const currentQuestionnaire = JSON.parse(decodeURIComponent(data));
			const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
			const storedQuestionnaire = allQuestionnaires.find(q => q.id === currentQuestionnaire.id);
			questionnaire.value = storedQuestionnaire || currentQuestionnaire;

			// 初始化滑动条默认值（关键修复）
			if (questionnaire.value) {
				questionnaire.value.questions.forEach(question => {
					if (question.type === 'slider' && question.answer === null) {
						question.answer = question.min || 0; // 设置初始值
					}
				});
			}
		} else {
			uni.navigateBack();
		}
	});

	const handleBack = () => {
		uni.navigateBack({
			delta: 1
		});
	};

	// 判断选项是否选中
	const isOptionSelected = (questionId, optionId) => {
		if (!questionnaire.value) return false;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (!question || !question.answer) return false;
		return question.type === 'single' ? question.answer === optionId : question.answer?.includes(optionId);
	};

	// 单选/多选选择选项
	const selectOption = (questionId, optionId) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (!question) return;

		if (question.type === 'single') {
			question.answer = optionId;
		} else if (question.type === 'multiple') {
			if (!question.answer) question.answer = [];
			const index = question.answer.indexOf(optionId);
			if (index > -1) {
				question.answer.splice(index, 1);
			} else {
				question.answer.push(optionId);
			}
		}
	};

	// 星级评分选中逻辑
	const isStarSelected = (questionId, index) => {
		if (!questionnaire.value) return false;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (!question || question.answer === null) return false;
		const optionIndex = question.options.findIndex(opt => opt.id === question.answer);
		return index <= optionIndex;
	};

	// 选择星级
	const getStarScore = (star) => {
		// 0-5星对应0 2 4 6 8 10分
		return star * 2;
	};

	const selectStar = (questionId, star) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (question) question.answer = star; // 存储星级（0-5）
	};

	// 计算滑块位置百分比（关键修复）
	const getSliderPosition = (question) => {
		const value = question.answer || 1;
		const min = 1;
		const max = 10;
		const percent = ((value - min) / (max - min)) * 100;
		return `${Math.max(0, Math.min(100, percent))}%`;
	};

	// 获取滑动条显示文本（关键修复）
	const getSliderText = (question) => {
		if (question.answer === null) question.answer = question.min || 0;
		// 优先显示数值，匹配不到选项时直接显示数值
		const matchedOption = question.options.find(opt => opt.value === question.answer);
		return matchedOption?.text || question.answer;
	};

	// 滑动过程中实时更新（关键修复）
	const handleSliderChanging = (questionId, e) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (question) question.answer = e.detail.value;
	};

	// 滑动结束确认
	const handleSliderChange = (questionId, e) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (question) question.answer = e.detail.value;
	};

	// 提交问卷时转换星级分数
	const submitQuestionnaire = () => {
		if (!questionnaire.value) return;

		// 验证所有问题是否已回答
		const allAnswered = questionnaire.value.questions.every(question => {
			return question.answer !== null && question.answer !== undefined;
		});

		if (!allAnswered) {
			uni.showToast({
				title: '请完成所有问题',
				icon: 'none'
			});
			return;
		}

		// 处理星级评分的分数转换（提交时转换为实际分数）
		const formattedQuestionnaire = JSON.parse(JSON.stringify(questionnaire.value));
		formattedQuestionnaire.questions.forEach(question => {
			if (question.type === 'rating') {
				// 转换为实际分数：0-5星 → 0 2 4 6 8 10分
				question.actualScore = question.answer * 2;
			} else if (question.type === 'slider') {
				// 滑动条直接使用其值作为分数
				question.actualScore = question.answer;
			}
		});

		uni.showLoading({
			title: '提交中...'
		});
		formattedQuestionnaire.status = 'completed';

		// 保存到本地存储
		const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
		const index = allQuestionnaires.findIndex(q => q.id === formattedQuestionnaire.id);
		if (index !== -1) {
			allQuestionnaires[index] = formattedQuestionnaire;
		} else {
			allQuestionnaires.push(formattedQuestionnaire);
		}
		uni.setStorageSync('questionnaires', JSON.stringify(allQuestionnaires));

		uni.hideLoading();
		uni.showToast({
			title: '提交成功',
			icon: 'success'
		});
		setTimeout(() => uni.navigateBack({
			delta: 1
		}), 800);
	};

	// 重置问卷
	const resetQuestionnaire = () => {
		uni.showModal({
			title: '提示',
			content: '确定重新填写？当前答案将清空',
			success: (res) => {
				if (res.confirm && questionnaire.value) {
					questionnaire.value.questions.forEach(question => {
						question.answer = null;
						// 重置滑动条默认值
						if (question.type === 'slider') {
							question.answer = question.min || 0;
						}
					});
					questionnaire.value.status = 'pending';
					const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
					const index = allQuestionnaires.findIndex(q => q.id === questionnaire.value.id);
					if (index !== -1) {
						allQuestionnaires[index] = JSON.parse(JSON.stringify(questionnaire.value));
						uni.setStorageSync('questionnaires', JSON.stringify(allQuestionnaires));
					}
					uni.showToast({
						title: '已重置，可重新填写',
						icon: 'none'
					});
				}
			}
		});
	};

	// onMounted(() => {
	//   const pages = getCurrentPages();
	//   const currentPage = pages[pages.length - 1];
	//   const data = currentPage.options.data;
	//   if (data) {
	//     const currentQuestionnaire = JSON.parse(decodeURIComponent(data));
	//     console.log('传递过来的问卷数据：', currentQuestionnaire.questions); // 打印1
	//     const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
	//     console.log('本地存储的所有问卷：', allQuestionnaires); // 打印2
	//     const storedQuestionnaire = allQuestionnaires.find(q => q.id === currentQuestionnaire.id);
	//     questionnaire.value = storedQuestionnaire || currentQuestionnaire;
	//     console.log('最终使用的问卷问题：', questionnaire.value.questions); // 打印3
	//   }
	// });
</script>

<style scoped>
	.questionnaire-detail-page {
		background-color: #f5f5f5;
		min-height: 100vh;
		font-size: 16px;
		padding-bottom: 140rpx;
	}

	/* 顶部导航栏样式 */
	.page-header {
		height: 120rpx;
		background-color: #87CEEB;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 30rpx;
		position: relative;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.back-button {
		position: absolute;
		left: 30rpx;
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}

	.back-icon {
		color: #fff;
		font-size: 36rpx;
		font-weight: bold;
	}

	.header-title {
		color: #fff;
		font-size: 36rpx;
		font-weight: 500;
		text-align: center;
		max-width: calc(100% - 120rpx);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 问卷内容样式 */
	.questionnaire-content {
		padding: 30rpx;
	}

	.question-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.question-number {
		font-size: 28rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 15rpx;
	}

	.question-text {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 25rpx;
		line-height: 1.6;
	}

	/* 单选样式 */
	.options-single {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	.option-single {
		display: flex;
		align-items: center;
		padding: 25rpx 30rpx;
		border: 1rpx solid #eaeaea;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #666;
		transition: all 0.2s;
	}

	.option-single.selected {
		border-color: #42b983;
		background-color: #f6ffed;
	}

	.radio-marker {
		width: 30rpx;
		height: 30rpx;
		border: 2rpx solid #999;
		border-radius: 50%;
		margin-right: 20rpx;
		position: relative;
	}

	.option-single.selected .radio-marker {
		border-color: #42b983;
	}

	.radio-dot {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 16rpx;
		height: 16rpx;
		background-color: #42b983;
		border-radius: 50%;
	}

	/* 多选样式 */
	.options-multiple {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	.option-multiple {
		display: flex;
		align-items: center;
		padding: 25rpx 30rpx;
		border: 1rpx solid #eaeaea;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #666;
		transition: all 0.2s;
	}

	.option-multiple.selected {
		border-color: #42b983;
		background-color: #f6ffed;
	}

	.checkbox-marker {
		width: 30rpx;
		height: 30rpx;
		border: 2rpx solid #999;
		border-radius: 6rpx;
		margin-right: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.option-multiple.selected .checkbox-marker {
		background-color: #42b983;
		border-color: #42b983;
	}

	.check-icon {
		color: white;
		font-size: 20rpx;
		font-weight: bold;
	}

	/* 星级评分样式 */
	.options-rating {
		display: flex;
		justify-content: space-around;
		width: 100%;
		padding: 10rpx 0;
		box-sizing: border-box;
	}

	.star-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 15rpx 5rpx;
		font-size: 40rpx;
		color: #ccc;
		transition: all 0.2s;
		cursor: pointer;
		flex: 1;
		text-align: center;
	}

	.star-item.selected {
		color: #faad14;
	}

	.star-text {
		font-size: 22rpx;
		margin-top: 8rpx;
		white-space: nowrap;
	}

	/* 滑动条样式（重点修复） */
	.options-slider {
		padding: 40rpx 20rpx 20rpx;
		/* 增加左右内边距 */
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* 整体居中 */
	}

	.slider-container {
		width: 100%;
		/* 保持满宽 */
		max-width: 600rpx;
		/* 限制最大宽度 */
		padding: 0 10rpx;
		position: relative;
		height: 80rpx;
	}

	/* 滑动提示气泡 */
	.slider-tooltip-wrapper {
		position: absolute;
		top: -50rpx;
		transform: translateX(-50%);
		pointer-events: none;
		z-index: 10;
	}

	.slider-tooltip {
		background-color: #42b983;
		color: white;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		font-size: 26rpx;
		white-space: nowrap;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.tooltip-arrow {
		width: 0;
		height: 0;
		border-left: 10rpx solid transparent;
		border-right: 10rpx solid transparent;
		border-top: 10rpx solid #42b983;
		margin: 0 auto;
	}


	/* 滑块样式优化 */
	slider {
		width: 100%;
		height: 80rpx;
		margin: 0 auto;
	}

	/* 标签样式优化 */
	.slider-labels {
		display: flex;
		justify-content: space-between;
		width: 100%;
		max-width: 600rpx;
		font-size: 24rpx;
		color: #666;
		margin-top: 10rpx;
		padding: 0 10rpx;
	}

	/* 底部操作区 */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20rpx 30rpx;
		background-color: #fff;
		border-top: 1rpx solid #eaeaea;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 99;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.submit-btn {
		background-color: #42b983;
		color: #fff;
		border: none;
		border-radius: 60rpx;
		width: 600rpx;
		padding: 25rpx 0;
		text-align: center;
		font-size: 30rpx;
		box-shadow: 0 4rpx 10rpx rgba(66, 185, 131, 0.3);
	}

	.reset-btn {
		width: 600rpx;
		padding: 25rpx 0;
		text-align: center;
		color: #42b983;
		border: 1rpx solid #42b983;
		border-radius: 60rpx;
		font-size: 30rpx;
		background-color: #fff;
	}

	/* 加载状态 */
	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300rpx;
		color: #999;
		font-size: 28rpx;
	}
</style>