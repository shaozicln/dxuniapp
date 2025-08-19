<template>
	<view class="questionnaire-page">

		<view class="page-header">
			<!-- 返回按钮 -->
			<view class="back-button" @click="handleBack">
				<text class="back-icon">←</text>
			</view>
			<view class="header-title">我的问卷</view>
		</view>

		<!-- 筛选栏 -->
		<view class="filter-bar">
			<view class="filter-item" :class="{ active: currentFilter === 'all' }" @click="currentFilter = 'all'">全部
			</view>
			<view class="filter-item" :class="{ active: currentFilter === 'pending' }"
				@click="currentFilter = 'pending'">未完成</view>
			<view class="filter-item" :class="{ active: currentFilter === 'completed' }"
				@click="currentFilter = 'completed'">已完成</view>
		</view>

		<view v-if="isInitialState" class="initial-hint">
			点击左下角左下角选择对应课程问卷
		</view>
		<!-- 问卷列表区域 -->
		<view v-else class="questionnaire-list">
			<view class="questionnaire-item" v-for="(questionnaire, index) in filteredQuestionnaires" :key="index"
				@click="navigateToDetail(questionnaire)">
				<view class="questionnaire-header">
					<view class="questionnaire-title">{{ questionnaire.title }}</view>
					<view class="questionnaire-status"
						:class="questionnaire.status === 'completed' ? 'status-completed' : 'status-pending'">
						{{ questionnaire.status === 'completed' ? '已完成' : '未完成' }}
					</view>
				</view>
				<view class="questionnaire-meta">
					<view class="questionnaire-grade">分级: {{ questionnaire.grade }}</view>
					<view class="questionnaire-date">{{ questionnaire.date }}</view>
				</view>
				<view class="questionnaire-desc">{{ questionnaire.description }}</view>
			</view>
		</view>

		<!-- 左下角悬浮按钮（三条杠图标） -->
		<view class="float-button" @click="showCheckCourse = true">
			<view class="bar"></view>
			<view class="bar"></view>
			<view class="bar"></view>
		</view>

		<!-- 弹窗容器（包含checkCourseOnr组件） -->
		<view v-if="showCheckCourse" class="modal-overlay" @click="showCheckCourse = false">
			<view class="modal-content" @click.stop>
				<check-course-qnr @close="showCheckCourse = false" @selectCourse="handleSelectCourse" />
			</view>
		</view>

	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted,
	} from 'vue';

	import {
		onShow
	} from '@dcloudio/uni-app';
	import checkCourseQnr from '@/pages/questionnaire/checkCourseQnr.vue';

	import {
		get
	} from '@/utils/request/request.js';

	const questionnaires = ref([]);
	// 初始状态控制变量
	const isInitialState = ref(true);

	// 抽离的加载数据方法（通用逻辑）
	const loadQuestionnaires = () => {
		const savedQuestionnaires = uni.getStorageSync('questionnaires');
		if (savedQuestionnaires) {
			const loadedData = JSON.parse(savedQuestionnaires);
			// 清空原有数据并替换为最新数据（确保响应式更新）
			questionnaires.value.splice(0, questionnaires.value.length);
			loadedData.forEach(item => {
				questionnaires.push(item);
			});
			// 有数据则退出初始状态
			isInitialState.value = loadedData.length === 0;
		} else {
			// 首次加载且无本地数据时，保存初始数据
			uni.setStorageSync('questionnaires', JSON.stringify(questionnaires));
		}
	};

	//通过课程信息获取问卷数据
	const fetchCourseQuestionnaires = async (courseNo, classSerial) => {
		try {
			uni.showLoading({
				title: '获取问卷中...'
			});

			const res = await get('/qnr/getCourseQnrCon', {
				courseNo,
				classSerial
			});

			uni.hideLoading();
			if (res.code === 200) {
				// 转换API返回数据格式
				const formattedData = res.data.map(item => ({
					id: item.questionnaireId,
					title: item.questionnaireName,
					grade: '课程问卷', // 可根据实际需求调整
					description: `课程: ${item.courseName} 教师: ${item.teacherName}`,
					date: new Date().toLocaleDateString(), // 使用当前日期或接口返回的日期
					status: 'pending', // 默认为未完成状态
					questions: item.questions.map(question => ({
						id: question.id,
						text: question.name,
						type: mapQuestionType(question.scoringTypeId),
						//options: getDefaultOptions(question.scoringTypeId),
						// 为滑动条和星级设置范围属性
						min: question.scoringTypeId === 3 ? 0 : (question
							.scoringTypeId === 4 ? 1 : undefined),
						max: question.scoringTypeId === 3 ? 5 : (question
							.scoringTypeId === 4 ? 10 : undefined),
						step: question.scoringTypeId === 4 ? 1 : undefined,
						answer: null
					}))
				}));

				// questionnaires.value = res.rows || [];
				questionnaires.value = formattedData;
				console.log(questionnaires.value);
				// 保存到本地存储
				uni.setStorageSync('questionnaires', JSON.stringify(formattedData));

				// 获取数据后退出初始状态
				isInitialState.value = false;
			} else {
				uni.showToast({
					title: res.msg || '未找到相关问卷',
					icon: 'none'
				});
			}
		} catch (err) {
			uni.hideLoading();
			console.error('获取课程问卷失败:', err);
			uni.showToast({
				title: '获取问卷失败，请重试',
				icon: 'none'
			});
		}
	};
	// 辅助函数：映射题型（根据实际业务调整）
	const mapQuestionType = (typeId) => {
		// 假设1:单选题, 2:多选题, 3:评分题, 4:滑动条
		const typeMap = {
			1: 'single',
			2: 'multiple',
			3: 'rating',
			4: 'slider'
		};
		return typeMap[typeId] || 'single';
	};

	// 辅助函数：根据题型生成默认选项（根据实际业务调整）
	const getDefaultOptions = (typeId) => {
		switch (typeId) {
			case 1: // 单选题
				return [{
						id: 1,
						text: '选项1'
					},
					{
						id: 2,
						text: '选项2'
					},
					{
						id: 3,
						text: '选项3'
					},
					{
						id: 4,
						text: '选项4'
					}
				];
			case 2: // 多选题
				return [{
						id: 1,
						text: '选项A'
					},
					{
						id: 2,
						text: '选项B'
					},
					{
						id: 3,
						text: '选项C'
					},
					{
						id: 4,
						text: '选项D'
					}
				];
			case 3: // 打星题
				return {
					min: 0, max: 5
				};
			case 4: // 滑动条
				return {
					min: 1, max: 10, step: 1
				};
			default:
				return [];
		}
	};

	// 页面加载时初始化数据
	onMounted(() => {
		loadQuestionnaires();
	});

	onShow(() => {
		loadQuestionnaires(); // 从详情页返回时重新加载数据
	});


	// 当前筛选条件
	const currentFilter = ref('all');

	// 显示的问卷列表
	const filteredQuestionnaires = computed(() => {
		if (currentFilter.value === 'all') {
			return questionnaires.value;
		} else if (currentFilter.value === 'pending') {
			return questionnaires.value.filter(q => q.status === 'pending');
		} else {
			return questionnaires.value.filter(q => q.status === 'completed');
		}
	});

	// 跳转到问卷详情页（小程序路由）
	const navigateToDetail = (questionnaire) => {
		uni.navigateTo({
			url: `/pages/questionnaire/questionnaireDetail?data=${encodeURIComponent(JSON.stringify(questionnaire))}`
		});
	};

	const handleBack = () => {
		uni.navigateBack({
			delta: 1 // 返回上一级页面
		});
	};

	// 控制弹窗显示
	const showCheckCourse = ref(false);

	// 接收课程选择事件
	const handleSelectCourse = (courseNo, classSerial) => {
		showCheckCourse.value = false;
		// 这里可以处理课程选择后的逻辑（如更新问卷数据）
		fetchCourseQuestionnaires(courseNo, classSerial);
		console.log('选中课程：', courseNo, classSerial);
	};
</script>

<style scoped>
	.initial-hint {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 32rpx;
		color: #999;
		text-align: center;
		padding: 0 30rpx;
	}

	.questionnaire-page {
		background-color: #f5f5f5;
		min-height: 100vh;
		font-size: 16px;
	}

	.page-header {
		height: 120rpx;
		background-color: #c9edf5;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 30rpx 30rpx 15rpx;
		position: relative;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 15px;
	}



	.filter-bar {
		display: flex;
		background-color: #fff;
		border-bottom: 1rpx solid #eaeaea;
	}

	.filter-item {
		flex: 1;
		text-align: center;
		padding: 25rpx 0;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.filter-item.active {
		color: #42b983;
		font-weight: 500;
	}

	.filter-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 40rpx;
		height: 6rpx;
		background-color: #42b983;
		border-radius: 3rpx;
	}

	.questionnaire-list {
		padding: 20rpx;
	}

	.questionnaire-item {
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		transition: transform 0.2s;
	}

	.questionnaire-item:active {
		transform: scale(0.99);
	}

	.questionnaire-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.questionnaire-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
		max-width: 80%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.questionnaire-status {
		padding: 8rpx 16rpx;
		border-radius: 16rpx;
		font-size: 24rpx;
	}

	.status-completed {
		background-color: #e8f5e9;
		color: #4caf50;
	}

	.status-pending {
		background-color: #f3f3f3;
		color: #999;
	}

	.questionnaire-meta {
		display: flex;
		color: #666;
		font-size: 24rpx;
		margin-bottom: 15rpx;
	}

	.questionnaire-grade {
		margin-right: 20rpx;
	}

	.questionnaire-desc {
		color: #888;
		font-size: 26rpx;
		line-height: 1.5;
		max-height: 80rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.back-icon {
		color: #fff;
		font-size: 36rpx;
		font-weight: bold;
	}

	.back-button {
		position: absolute;
		left: 20rpx;
		top: 60rpx;
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		transition: background-color 0.2s;
	}

	.back-button:active {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.back-icon {
		color: #fff;
		font-size: 36rpx;
		font-weight: bold;
	}


	/* 标题样式（保持居中） */
	.header-title {
		color: #777;
		font-size: 36rpx;
		font-weight: 500;
		flex: 1;
		text-align: center;
		margin-left: -100rpx;
		/* 抵消返回按钮宽度，确保标题居中 */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 悬浮按钮样式 */
	.float-button {
		position: fixed;
		left: 30rpx;
		bottom: 30rpx;
		width: 80rpx;
		height: 80rpx;
		background-color: #42b983;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
		z-index: 999;
	}

	.bar {
		width: 40rpx;
		height: 6rpx;
		background-color: white;
		border-radius: 3rpx;
		margin: 4rpx 0;
	}

	/* 弹窗遮罩层 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: flex-end;
	}

	/* 弹窗内容（占屏幕下方70%） */
	.modal-content {
		width: 100%;
		height: 85vh;
		background-color: white;
		border-top-left-radius: 30rpx;
		border-top-right-radius: 30rpx;
		overflow: hidden;
	}
</style>