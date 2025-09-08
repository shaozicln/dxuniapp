<template>
	<view class="questionnaire-detail-page">
		<view class="page-header" v-if="questionnaire">
			<view class="back-button" @click="handleBack">
				<text class="back-icon">←</text>
			</view>
			<view class="header-title">{{ questionnaire.title }}</view>
		</view>

		<view class="loading-state" v-else>
			<text>加载中...</text>
		</view>

		<view class="questionnaire-content" v-if="questionnaire">
			<view class="question-item" v-for="(question, qIndex) in questionnaire.questions" :key="qIndex">
				<view class="question-number">{{ qIndex + 1 }}. {{ getQuestionTag(question) }}</view>
				<view class="question-text">{{ question.text }}</view>

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

					<!-- 4. 滑动条打分 -->
					<view v-if="question.type === 'slider'" class="options-slider">
						<view class="slider-container">
							<view class="slider-tooltip-wrapper" :style="{ left: getSliderPosition(question) }">
								<view class="slider-tooltip">{{ question.answer }}分</view>
								<view class="tooltip-arrow"></view>
							</view>

							<slider :min="1" :max="10" :step="1" :value="question.answer || 1"
								@changing="handleSliderChanging(question.id, $event)"
								@change="handleSliderChange(question.id, $event)" activeColor="#42b983"
								backgroundColor="#eaeaea" block-size="32rpx" block-color="#42b983"
								block-border-radius="50%"></slider>
						</view>

						<view class="slider-labels">
							<text>1分</text>
							<text>10分</text>
						</view>
					</view>

					<!-- 5. 是否选择题（关键修改：添加条件判断） -->
					<view v-if="isBooleanQuestion(question)" class="options-boolean">
						<view class="option-boolean" v-for="(option, oIndex) in question.options" :key="oIndex"
							:class="{ selected: isOptionSelected(question.id, option.id) }"
							@click="selectOption(question.id, option.id)">
							<view class="radio-marker">
								<view class="radio-dot" v-if="isOptionSelected(question.id, option.id)"></view>
							</view>
							<text>{{ option.text }}</text>
						</view>
					</view>

					<!-- 6. 特殊问题的文本框逻辑（只对特定类型显示） -->
					<view class="options-open" v-if="question.qtype === 4 && question.scoringTypeId === 5 && 
					                isOptionSelected(question.id, 1)">
						<textarea v-model="question.textAnswer" placeholder="请输入相关问题..." class="open-textarea"
							@input="handleTextInput(question.id, $event)"></textarea>
					</view>

					<!-- 7. 纯文本框问题 -->
					<view class="options-open" v-if="question.qtype === 4 && question.scoringTypeId === 6">
						<textarea v-model="question.textAnswer" placeholder="请输入文本..." class="open-textarea"
							@input="handleTextInput(question.id, $event)"></textarea>
					</view>
				</view>
			</view>
		</view>

		<view class="bottom-actions" v-if="questionnaire">
			<view class="reset-btn" v-if="questionnaire.status === 'completed'" @click="resetQuestionnaire">
				重新填写
			</view>
			<button class="submit-btn" v-if="questionnaire.status !== 'completed'" @click="submitQuestionnaire"
				:disabled="submitting">
				{{ submitting ? '提交中...' : '提交问卷' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue';
	import {
		post
	} from '@/utils/request/request.js'

	const questionnaire = ref(null);
	const submitting = ref(false);

	const currentCourse = ref(JSON.parse(uni.getStorageSync('currentCourse') || '{}'));

	onMounted(() => {
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const data = currentPage.options.data;
		if (data) {
			const currentQuestionnaire = JSON.parse(decodeURIComponent(data));
			const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
			const storedQuestionnaire = allQuestionnaires.find(q => q.id === currentQuestionnaire.id);
			questionnaire.value = storedQuestionnaire || currentQuestionnaire;

			if (questionnaire.value) {
				questionnaire.value.questions.forEach(question => {
					if (question.answer === null || question.answer === undefined) {
						if (question.type === 'slider') {
							question.answer = question.min || 0;
						} else if (question.type === 'rating') {
							question.answer = 0;
						}
					}
					// 初始化文本答案字段
					if (question.textAnswer === undefined) {
						question.textAnswer = '';
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

	const getQuestionTag = (question) => {
		switch (question.scoringTypeId) {
			case 1:
				return '[单选题]';
			case 2:
				return '[多选题]';
			case 3:
				return '[打星题]';
			case 4:
				return '[滑动打分题]';
			case 5:
				return '[反馈问题指标题]';
			case 6:
				return '[文本题]';
			default:
				return '';
		}
	};

	// 判断是否为是否题（包括通用和特殊是否题）
	const isBooleanQuestion = (question) => {
		// 只对需要显示是否选项的题目返回true
		return question.type === 'boolean' ||
			(question.qtype === 4 && question.scoringTypeId === 5);
	};

	const isOptionSelected = (questionId, optionId) => {
		if (!questionnaire.value) return false;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (!question || !question.answer) return false;
		return question.type === 'single' || question.type === 'boolean' ?
			question.answer === optionId :
			question.answer?.includes(optionId);
	};

	const handleTextInput = (questionId, e) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (question) {
			question.textAnswer = e.detail.value;
		}
	};

	const selectOption = (questionId, optionId) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (!question) return;

		if (question.type === 'single' || question.type === 'boolean') {
			question.answer = optionId;
			const selectedOption = question.options.find(opt => opt.id === optionId);
			// if (selectedOption) {
			// 	submitScore(questionId, selectedOption.value || 0);
			// }
		} else if (question.type === 'multiple') {
			if (!question.answer) question.answer = [];
			const index = question.answer.indexOf(optionId);
			if (index > -1) {
				question.answer.splice(index, 1);
			} else {
				question.answer.push(optionId);
			}
			const selectedOptions = question.options.filter(opt => question.answer.includes(opt.id));
			// const score = selectedOptions.length ?
			// 	Math.round(selectedOptions.reduce((sum, opt) => sum + (opt.value || 0), 0) / selectedOptions.length) :
			// 	0;
			// submitScore(questionId, score);
		}
	};

	const selectStar = (questionId, star) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (question) {
			question.answer = star;
			// const score = Math.round((star / 5) * 100);
			// submitScore(questionId, score);
		}
	};

	const getSliderPosition = (question) => {
		const value = question.answer || 1;
		const min = 1;
		const max = 10;
		const percent = ((value - min) / (max - min)) * 100;
		return `${Math.max(0, Math.min(100, percent))}%`;
	};

	const handleSliderChanging = (questionId, e) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (question) question.answer = e.detail.value;
	};

	const handleSliderChange = (questionId, e) => {
		if (!questionnaire.value) return;
		const question = questionnaire.value.questions.find(q => q.id === questionId);
		if (question) {
			question.answer = e.detail.value;
			// const score = Math.round((e.detail.value / 10) * 100);
			// submitScore(questionId, score);
		}
	};

	const getStarScore = (star) => {
		return star * 2;
	};

	const userInfo = uni.getStorageSync('userInfo') || '[]';

	// 计算试卷得分
	const calculateTotalScore = () => {
		let total = 0;
		questionnaire.value.questions.forEach(question => {
			if (question.type === 'single') {
				const selectedOption = question.options.find(opt => opt.id === question.answer);
				total += selectedOption?.value || 0;
			}
			// TODO：其他题型的得分计算逻辑
		});
		return total;
	};


	// 评分等级计算函数
	const getScoreLevel = (score) => {
		if (!score) return null;
		if (score === 10) return 'A';
		if (score === 8) return 'B';
		if (score === 6) return 'C';
		if (score === 4) return 'D';
		return 'E';
	};

	// 在submitQuestionnaire方法中添加
	const submitQuestionnaire = async () => {
		if (!questionnaire.value || submitting.value) return;

		// 验证所有问题是否已回答（保持原有的验证逻辑）
		const allAnswered = questionnaire.value.questions.every(question => {
			// 可选问题可以不回答
			if (question.qtype === 3) return true;

			// 特殊类型验证
			if (question.qtype === 4) {
				if (question.scoringTypeId === 5) {
					// 必须选择是/否，选是则文本框必填
					if (question.answer === null || question.answer === undefined) return false;
					return question.answer !== 1 || (question.textAnswer && question.textAnswer.trim() !==
						'');
				}
				if (question.scoringTypeId === 6) {
					// 文本框必填
					return question.textAnswer && question.textAnswer.trim() !== '';
				}
			}

			// 其他问题必须回答
			return question.answer !== null && question.answer !== undefined &&
				(question.type !== 'multiple' || question.answer.length > 0);
		});


		if (!allAnswered) {
			uni.showToast({
				title: '请完成所有必填问题',
				icon: 'none'
			});
			return;
		}

		try {
			submitting.value = true;

			// 1. 构建提交数据
			const submitData = {
				mainData: {
					questionnaireId: questionnaire.value.id,
					publishId: questionnaire.value.publishId || "202305001",
					academicYearSemester: questionnaire.value.academicYearSemester || "2025-2026学年 第一学期",
					questionnaireName: questionnaire.value.title,
					questionnaireType: "课程评估",
					questionnaireCategory: '',
					evalType: "绩效评估",
					evalTarget: "课堂教师",
					evaluationRequirement: "必修课评估",
					kclx: questionnaire.value.kclx,
					skdd: questionnaire.value.skdd,
					courseNo: questionnaire.value.courseNo,
					classSerial: questionnaire.value.classSerial,
					courseName: questionnaire.value.courseName,
					studentClass: '',
					courseDepartment: '',
					teacherId: "T1001",
					teacherName: questionnaire.value.teacherName,
					teacherDepartment: "计算机学院",
					teacherTitle: "副教授",
					evaluatorId: userInfo.teacherId,
					evaluatorName: userInfo.name,
					evaluatorType: "教师",
					evaluatorDepartment: "计算机学院",
					totalScore: 100.00,
					obtainedScore: calculateTotalScore(),
					evaluationTime: "2024-03-15T14:30:00"
				},
				targetScores: questionnaire.value.questions.map(question => {
					// 根据问题类型构建不同的得分数据
					let scoreValue = null;
					let singleChoice = null;
					let fillInBlank = null;

					if (question.type === 'slider') {
						scoreValue = question.answer;
					} else if (question.type === 'rating') {
						scoreValue = question.answer * 2; // 转换为10分制
					} else if (question.type === 'single' || question.type === 'boolean') {
						singleChoice = question.answer;
						// 如果选项有分值，使用选项分值
						const selectedOption = question.options.find(opt => opt.id === question
							.answer);
						if (selectedOption && selectedOption.value) {
							scoreValue = selectedOption.value;
						}
					} else if (question.type === 'multiple') {
						// 多选可以计算选中项的平均分
						const selectedOptions = question.options.filter(opt => question.answer
							.includes(opt.id));
						if (selectedOptions.length > 0) {
							scoreValue = Math.round(selectedOptions.reduce((sum, opt) => sum + (opt
								.value || 0), 0) / selectedOptions.length);
						}
					} else if (question.textAnswer) {
						fillInBlank = question.textAnswer;
					}


					return {
						targetUserId: userInfo.teacherId || '', // 被评估教师ID
						scoreLevel: getScoreLevel(scoreValue), // 计算评分等级
						questionnaireId: questionnaire.value.id,
						questionId: question.id,
						gradingMethodId: question.gmtype || 1,
						scoreValue,
						singleChoice,
						fillInBlank,
						scoreTime: new Date().toISOString()
					};
				})
			};


			// 2. 调用提交接口
			const res = await post('/result/submit', submitData);

			if (res.code === 200) {
				// 3. 提交成功处理
				questionnaire.value.status = 'completed';

				console.log("ok");

				// 更新本地存储
				const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
				const index = allQuestionnaires.findIndex(q => q.id === questionnaire.value.id);
				if (index !== -1) {
					allQuestionnaires[index] = questionnaire.value;
				} else {
					allQuestionnaires.push(questionnaire.value);
				}
				uni.setStorageSync('questionnaires', JSON.stringify(allQuestionnaires));

				uni.showToast({
					title: '问卷提交成功',
					icon: 'success'
				});

				setTimeout(() => uni.navigateBack({
					delta: 1
				}), 800);
			} else {
				uni.showToast({
					title: `提交失败: ${res.msg || '未知错误'}`,
					icon: 'none'
				});
			}
		} catch (err) {
			console.error('提交问卷异常:', err);
			uni.showToast({
				title: '网络错误，提交失败',
				icon: 'none'
			});
		} finally {
			submitting.value = false;
		}
	};

	const resetQuestionnaire = () => {
		uni.showModal({
			title: '提示',
			content: '确定重新填写？当前答案将清空',
			success: (res) => {
				if (res.confirm && questionnaire.value) {
					questionnaire.value.questions.forEach(question => {
						question.answer = null;
						question.textAnswer = ''; // 清空文本答案
						if (question.type === 'slider') {
							question.answer = question.min || 0;
						} else if (question.type === 'rating') {
							question.answer = 0;
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
</script>

<style scoped>
	.questionnaire-detail-page {
		background-color: #f5f5f5;
		min-height: 100vh;
		font-size: 16px;
		padding-bottom: 140rpx;
	}

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

	.question-number {
		color: #f56c6c;
		font-weight: bold;
	}

	.question-number {
		color: #409eff;
	}

	.question-number {
		color: #faad14;
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

	.option-single.selected .radio-marker,
	.option-boolean.selected .radio-marker {
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

	/* 滑动条样式 */
	.options-slider {
		padding: 40rpx 20rpx 20rpx;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.slider-container {
		width: 100%;
		max-width: 600rpx;
		padding: 0 10rpx;
		position: relative;
		height: 80rpx;
	}

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

	slider {
		width: 100%;
		height: 80rpx;
		margin: 0 auto;
	}

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

	/* 是否题样式（一行显示，均匀分布） */
	.options-boolean {
		display: flex;
		justify-content: space-around;
		gap: 20rpx;
		padding: 10rpx 0;
		width: 100%;
		box-sizing: border-box;
	}

	.option-boolean {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 25rpx 30rpx;
		border: 1rpx solid #eaeaea;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #666;
		transition: all 0.2s;
		box-sizing: border-box;
	}

	.option-boolean.selected {
		border-color: #42b983;
		background-color: #f6ffed;
	}

	/* 开放问题样式 */
	.options-open {
		padding: 10rpx 0;
	}

	.open-textarea {
		width: 100%;
		min-height: 200rpx;
		padding: 20rpx;
		border: 1rpx solid #eaeaea;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #333;
		line-height: 1.6;
		resize: vertical;
		box-sizing: border-box;
	}

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

	.submit-btn:disabled {
		background-color: #a0d9b9;
		cursor: not-allowed;
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

	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300rpx;
		color: #999;
		font-size: 28rpx;
	}
</style>