<template>
	<view class="questionnaire-page">
		<!-- 顶部背景区域 -->
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

		<!-- 问卷列表区域 -->
		<view class="questionnaire-list">
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

	// 模拟后端返回的问卷数据
	const questionnaires = reactive([{
			id: 1,
			title: '2025级新生入学调查问卷',
			grade: '基础级',
			description: '请新生填写个人基本信息和入学期望',
			date: '2025-09-01',
			status: 'completed',
			questions: [{
					id: 101,
					text: '你的姓名是？',
					type: 'single',
					options: [{
							id: 1001,
							text: '张三'
						},
						{
							id: 1002,
							text: '李四'
						},
						{
							id: 1003,
							text: '王五'
						},
						{
							id: 1004,
							text: '其他'
						}
					],
					answer: 1001
				},
				{
					id: 102,
					text: '你选择的专业是？',
					type: 'single',
					options: [{
							id: 1005,
							text: '计算机科学与技术'
						},
						{
							id: 1006,
							text: '软件工程'
						},
						{
							id: 1007,
							text: '物联网工程'
						},
						{
							id: 1008,
							text: '人工智能'
						}
					],
					answer: 1006
				},
				{
					id: 103,
					text: '你对大学生活的期望是？',
					type: 'multiple',
					options: [{
							id: 1009,
							text: '学习专业知识'
						},
						{
							id: 1010,
							text: '参加社团活动'
						},
						{
							id: 1011,
							text: '锻炼身体'
						},
						{
							id: 1012,
							text: '结交朋友'
						}
					],
					answer: [1009, 1012]
				},
				{
					id: 104,
					text: '请对课程质量进行评分',
					type: 'slider',
					min: 0,
					max: 10,
					step: 1,
					options: [{
							id: 4001,
							text: '极差',
							value: 0
						},
						{
							id: 4002,
							text: '较差',
							value: 2
						},
						{
							id: 4003,
							text: '一般',
							value: 5
						},
						{
							id: 4004,
							text: '良好',
							value: 8
						},
						{
							id: 4005,
							text: '优秀',
							value: 10
						}
					],
					answer: 0
				}
			]
		},
		{
			id: 2,
			title: '课程满意度调查问卷',
			grade: '进阶级',
			description: '对本学期已完成课程的评价和建议',
			date: '2023-12-15',
			status: 'pending',
			questions: [{
					id: 201,
					text: '你对《数据结构》课程的满意度如何？',
					type: 'rating',
					options: [{
							id: 2001,
							text: '非常满意'
						},
						{
							id: 2002,
							text: '满意'
						},
						{
							id: 2003,
							text: '一般'
						},
						{
							id: 2004,
							text: '不满意'
						},
						{
							id: 2005,
							text: '非常不满意'
						}
					],
					answer: null
				},
				{
					id: 202,
					text: '你认为《数据结构》课程的教学方法是否有效？',
					type: 'single',
					options: [{
							id: 2006,
							text: '非常有效'
						},
						{
							id: 2007,
							text: '有效'
						},
						{
							id: 2008,
							text: '一般'
						},
						{
							id: 2009,
							text: '无效'
						}
					],
					answer: null
				},
				{
					id: 203,
					text: '你希望在下学期的课程中增加哪些内容？',
					type: 'multiple',
					options: [{
							id: 2010,
							text: '更多实践项目'
						},
						{
							id: 2011,
							text: '案例分析'
						},
						{
							id: 2012,
							text: '小组讨论'
						},
						{
							id: 2013,
							text: '邀请行业专家讲座'
						}
					],
					answer: null
				}
			]
		},
		{
			id: 3,
			title: '校园生活质量调查问卷',
			grade: '高级',
			description: '对校园设施、服务和活动的评价',
			date: '2024-03-20',
			status: 'pending',
			questions: [{
					id: 301,
					text: '你对学校食堂的满意度如何？',
					type: 'rating',
					options: [{
							id: 3001,
							text: '非常满意'
						},
						{
							id: 3002,
							text: '满意'
						},
						{
							id: 3003,
							text: '一般'
						},
						{
							id: 3004,
							text: '不满意'
						},
						{
							id: 3005,
							text: '非常不满意'
						}
					],
					answer: null
				},
				{
					id: 302,
					text: '你经常使用的校园设施有哪些？',
					type: 'multiple',
					options: [{
							id: 3006,
							text: '图书馆'
						},
						{
							id: 3007,
							text: '体育馆'
						},
						{
							id: 3008,
							text: '自习室'
						},
						{
							id: 3009,
							text: '实验室'
						},
						{
							id: 3010,
							text: '食堂'
						}
					],
					answer: null
				},
				{
					id: 303,
					text: '你希望学校增加哪些类型的校园活动？',
					type: 'multiple',
					options: [{
							id: 3011,
							text: '学术讲座'
						},
						{
							id: 3012,
							text: '文化节'
						},
						{
							id: 3013,
							text: '体育比赛'
						},
						{
							id: 3014,
							text: '创新创业活动'
						},
						{
							id: 3015,
							text: '志愿者服务'
						}
					],
					answer: null
				}
			]
		}
	]);
	// 抽离的加载数据方法（通用逻辑）
	const loadQuestionnaires = () => {
		const savedQuestionnaires = uni.getStorageSync('questionnaires');
		if (savedQuestionnaires) {
			const loadedData = JSON.parse(savedQuestionnaires);
			// 清空原有数据并替换为最新数据（确保响应式更新）
			questionnaires.splice(0, questionnaires.length);
			loadedData.forEach(item => {
				questionnaires.push(item);
			});
		} else {
			// 首次加载且无本地数据时，保存初始数据
			uni.setStorageSync('questionnaires', JSON.stringify(questionnaires));
		}
	};

	// 页面加载时初始化数据
	onMounted(() => {
		loadQuestionnaires();
	});

	// 正确使用小程序的 onShow 钩子（从 @dcloudio/uni-app 导入）
	onShow(() => {
		loadQuestionnaires(); // 从详情页返回时重新加载数据
	});


	// 当前筛选条件
	const currentFilter = ref('all');

	// 显示的问卷列表
	const filteredQuestionnaires = computed(() => {
		if (currentFilter.value === 'all') {
			return questionnaires;
		} else if (currentFilter.value === 'pending') {
			return questionnaires.filter(q => q.status === 'pending');
		} else {
			return questionnaires.filter(q => q.status === 'completed');
		}
	});

	// 跳转到问卷详情页（小程序路由）
	const navigateToDetail = (questionnaire) => {
		uni.navigateTo({
			url: `/pages/questionnaire/questionnaire-detail?data=${encodeURIComponent(JSON.stringify(questionnaire))}`
		});
	};

	const handleBack = () => {
		uni.navigateBack({
			delta: 1 // 返回上一级页面
		});
	};
</script>

<style scoped>
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
</style>