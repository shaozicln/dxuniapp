<template>
	<view class="check-course-container">
		<!-- 顶部标题栏 -->
		<view class="header">
			<view class="title">{{ currentCollege ? currentCollege : '选择学院' }}</view>
			<view class="back-btn" @click="handleBack" v-if="currentCollege">返回</view>
		</view>

		<!-- 学院列表区域 (未选择学院时显示) -->
		<view class="college-list" v-if="!currentCollege">
			<view class="college-card" v-for="college in filteredColleges" :key="college"
				@click="handleCollegeClick(college)">
				<view class="college-name">{{ college }}</view>
				<view class="course-count">包含 {{ getCourseCountByCollege(college) }} 门课程</view>
			</view>
		</view>

		<!-- 课程列表区域 (选择学院后显示) -->
		<view class="course-list" v-if="currentCollege">
			<view class="course-card" v-for="course in filteredCourses" :key="course.id"
				@click="handleCourseClick(course)">
				<view class="course-name">{{ course.courseName }}</view>
				<view class="teacher-name">-- {{ course.teacherName }}</view>

				<view class="more-btn" @click.stop="showDetail(course)">
					<view class="dot"></view>
					<view class="dot"></view>
					<view class="dot"></view>
				</view>
			</view>
		</view>

		<!-- 详情弹窗 -->
		<view v-if="currentDetail" class="detail-modal">
			<view class="detail-content">
				<view class="detail-title">{{ currentDetail.courseName }}</view>
				<view class="detail-item">课程号：{{ currentDetail.courseNo }}</view>
				<view class="detail-item">课序号：{{ currentDetail.classSerial }}</view>
				<view class="detail-item">学院：{{ currentDetail.courseCollege }}</view>
				<view class="detail-item">类型：{{ currentDetail.courseType }}</view>
				<view class="detail-item">学期：{{ currentDetail.academicTerm }}</view>
				<view class="detail-close" @click="currentDetail = null">关闭</view>
			</view>
		</view>
	</view>
	</template>

	<script setup>
	import {
		ref,
		onMounted,
		computed
	} from 'vue';
	import {
		get
	} from '@/utils/request/request.js'

	// 接收关闭事件
	const emit = defineEmits(['close', 'selectCourse']);

	// 课程数据
	const courses = ref([]);
	const loading = ref(false);
	const error = ref('');

	// 学院相关状态
	const currentCollege = ref(''); // 当前选中的学院
	const allColleges = computed(() => {
		// 获取所有不重复的学院
		const colleges = new Set();
		courses.value.forEach(course => {
			if (course.courseCollege) {
				colleges.add(course.courseCollege);
			}
		});
		return Array.from(colleges);
	});

	// 筛选相关
	const showFilter = ref(false);
	const filterText = ref('');
	const filteredColleges = computed(() => {
		if (!filterText.value) return allColleges.value;
		return allColleges.value.filter(college =>
			college.includes(filterText.value)
		);
	});

	// 根据当前学院筛选课程
	const filteredCourses = computed(() => {
		if (!currentCollege.value) return [];
		return courses.value.filter(course => course.courseCollege === currentCollege.value);
	});

	// 详情相关
	const currentDetail = ref(null);

	// 初始化加载课程数据
	onMounted(() => {
		fetchCourses();
	});

	const fetchCourses = async () => {
		try {
			loading.value = true;
			error.value = '';
			
			console.log('开始请求课程数据')
			const res = await get('/teaching_info/classInfo/list');
			console.log('请求返回结果:', res);

			if (res.code === 200) {
				courses.value = res.rows || [];
				console.log('获取课程成功，数据长度:', res.rows?.length || 0);
			} else {
				error.value = `获取失败: ${res.msg || '未知错误'}`;
			}

		} catch (err) {
			error.value = '网络错误，请检查接口是否可用';
			console.error('请求异常:', err);
		} finally {
			loading.value = false;
		}
	};

	// 计算某个学院的课程数量
	const getCourseCountByCollege = (college) => {
		return courses.value.filter(course => course.courseCollege === college).length;
	};

	// 学院点击事件
	const handleCollegeClick = (college) => {
		currentCollege.value = college;
	};

	// 返回按钮事件（从课程列表返回学院列表）
	const handleBack = () => {
		currentCollege.value = '';
	};

	// 课程点击事件
	const handleCourseClick = (course) => {
		emit('selectCourse', course.courseNo, course.classSerial);
	};

	// 显示详情
	const showDetail = (course) => {
		currentDetail.value = { ...course };
	};
	</script>

	<style scoped>
	.check-course-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	/* 头部样式 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 30rpx;
		border-bottom: 1rpx solid #eee;
	}

	.title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}

	.filter-btn, .back-btn {
		font-size: 28rpx;
		color: #42b983;
		padding: 10rpx 20rpx;
	}

	/* 学院列表 */
	.college-list {
		flex: 1;
		overflow-y: auto;
		padding: 20rpx;
	}

	.college-card {
		background-color: #f9f9f9;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.college-name {
		font-size: 32rpx;
		color: #333;
	}

	.course-count {
		font-size: 26rpx;
		color: #666;
		margin-top: 10rpx;
	}

	/* 课程列表 */
	.course-list {
		flex: 1;
		overflow-y: auto;
		padding: 20rpx;
	}

	.course-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #f9f9f9;
		border-radius: 16rpx;
		padding: 25rpx;
		margin-bottom: 20rpx;
		position: relative;
	}

	.course-name {
		font-size: 30rpx;
		color: #333;
	}

	.teacher-name {
		font-size: 26rpx;
		color: #666;
		margin-top: 5rpx;
	}

	/* 右侧三点按钮 */
	.more-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 60rpx;
		height: 100%;
	}

	.dot {
		width: 8rpx;
		height: 8rpx;
		background-color: #999;
		border-radius: 50%;
		margin: 5rpx 0;
	}

	/* 详情弹窗 */
	.detail-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.detail-content {
		width: 80%;
		background-color: white;
		border-radius: 20rpx;
		padding: 30rpx;
	}

	.detail-title {
		font-size: 34rpx;
		font-weight: 500;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.detail-item {
		font-size: 28rpx;
		margin-bottom: 20rpx;
		color: #555;
	}

	.detail-close {
		text-align: center;
		margin-top: 30rpx;
		color: #42b983;
		font-size: 30rpx;
		padding: 15rpx 0;
		border-top: 1rpx solid #eee;
	}
	</style>