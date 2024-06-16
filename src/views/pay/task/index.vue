<template>
	<div class="system-dic-container layout-padding mb-4" style="overflow-y:scroll">
		<el-collapse v-model="form.uploadTaskAct" class="collapse">
			<el-collapse-item title="上传任务" name="1">
				<template #title="">
					<h3>上传任务</h3>
				</template>
				<el-table :data="form.uploadTaskResult" border style="width: 100%" v-loading="config.tableUploadLoading"
					element-loading-text="数据正在加载中" element-loading-spinner="el-icon-loading">
					<el-table-column prop="id" label="主键" width="80">
					</el-table-column>
					<el-table-column prop="taskId" label="任务ID" width="300">
					</el-table-column>
					<el-table-column prop="taskName" label="任务名称" width="200">
					</el-table-column>
					<el-table-column prop="taskDesc" label="任务描述" width="300">
					</el-table-column>
					<el-table-column prop="uploadClient" label="上传客户端" width="500">
					</el-table-column>
					<el-table-column prop="createTime" label="创建时间" width="200">
					</el-table-column>
					<el-table-column fixed="right" label="操作" width="350">
						<template #default="scope">
							<el-button :loading="config[config.loading + scope.row.id]" @click="execTask(scope.row, 1)"
								size="small">执行一次</el-button>
							<el-button @click="addTask(scope.row)" size="small">添加到我的任务</el-button>
							<el-button size="small" type="danger" @click="del(scope.row)" plain>删除</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="pagination">
					<el-pagination background layout="total, sizes, prev, pager, next, jumper"
						:current-page="tablePage.pageNumber" :page-size="tablePage.pageSize"
						:page-sizes="tablePage.pageSizes" :total="tablePage.total" @size-change="handleSizeChange"
						@current-change="handlePageChange" />
				</div>

			</el-collapse-item>
		</el-collapse>
		<el-collapse v-model="form.myTaskAct" class="collapse">
			<el-collapse-item title="我的任务" name="1">
				<template #title="">
					<h3>我的任务</h3>
				</template>
				<el-table :data="form.myTaskResult" border style="width: 100%" v-loading="config.tableMineLoading"
					element-loading-text="数据正在加载中" element-loading-spinner="el-icon-loading">
					<el-table-column prop="id" label="主键" width="80">
					</el-table-column>
					<el-table-column prop="taskId" label="任务ID" width="300">
					</el-table-column>
					<el-table-column prop="taskName" label="任务名称" width="200">
					</el-table-column>
					<el-table-column prop="taskDesc" label="任务描述" width="300">
					</el-table-column>
					<el-table-column prop="createTime" label="创建时间" width="180">
					</el-table-column>
					<el-table-column prop="updateTime" label="更新时间" width="180">
					</el-table-column>
					<el-table-column fixed="right" label="操作" width="300">
						<template #default="scope">
							<el-button @click="execTaskAndTopic(scope.row, 1)"
								:loading="config[config.mineLoading + scope.row.id]" size="small">执行一次</el-button>
							<el-button @click="execTaskAndTopic(scope.row, 2)" size="small">下载到手机</el-button>
							<el-button size="small" type="danger" @click="delMine(scope.row)" plain>删除</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="pagination">
					<el-pagination background layout="total, sizes, prev, pager, next, jumper"
						:current-page="tablePageMine.pageNumber" :page-size="tablePageMine.pageSize"
						:page-sizes="tablePageMine.pageSizes" :total="tablePageMine.total"
						@size-change="handleSizeMineChange" @current-change="handlePageMineChange" />
				</div>

			</el-collapse-item>
		</el-collapse>

		<el-collapse v-model="form.exeLogAct" class="collapse">
			<el-collapse-item title="执行日志" name="1">
				<template #title="">
					<h3>执行日志</h3>
				</template>
				<el-table :data="form.exeLog" border style="width: 100%" v-loading="config.tableLogLoading"
					element-loading-text="数据正在加载中" element-loading-spinner="el-icon-loading">
					<el-table-column prop="id" label="主键" width="80">
					</el-table-column>
					<el-table-column prop="topic" label="执行通道" width="300">
					</el-table-column>
					<el-table-column prop="doParams" label="任务id" width="200">
					</el-table-column>
					<el-table-column prop="doStatus" label="执行状态" width="80">
						<template #default="scope">
							<span style="color: green;" v-if="scope.row.doStatus == 1">成功</span>
							<span style="color: red;" v-if="scope.row.doStatus == 0">失败</span>
						</template>
					</el-table-column>
					<el-table-column prop="doResult" label="执行结果">
					</el-table-column>
					<el-table-column prop="createTime" label="更新时间" width="200">
					</el-table-column>
				</el-table>
				<div class="pagination">
					<el-pagination background layout="total, sizes, prev, pager, next, jumper"
						:current-page="tablePageLog.pageNumber" :page-size="tablePageLog.pageSize"
						:page-sizes="tablePageLog.pageSizes" :total="tablePageLog.total" @size-change="handleSizeLogChange"
						@current-change="handlePageLogChange" />
				</div>
			</el-collapse-item>
		</el-collapse>

		<el-dialog title="选择执行通道" v-model="form.dialogVisible" width="20%">
			<el-select v-model="form.selTopic" placeholder="请选择" :change="selChange()">
				<el-option v-for="item in form.topics" :key="item" :label="item" :value="item">
				</el-option>
			</el-select>
			<div class="dialogBtn">
				<el-button size="default" @click="form.dialogVisible = false">取 消</el-button>
				<el-button type="primary" size="default" @click="execTask(form.rowData, 2)">确 定</el-button>
			</div>

		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { taskApi } from '/@/api/task/index'
import { payApi } from '/@/api/pay/index'


const config = reactive({
	loading: 1,
	mineLoading: 2,
	tableUploadLoading: true,
	tableMineLoading: true,
	tableLogLoading: true,

})

// do not use same name with ref
const form = reactive({
	uploadTaskAct: ['0'],
	myTaskAct: ['1'],
	exeLogAct: ['1'],
	exeLog: null,
	uploadTaskResult: [],
	myTaskResult: [],
	dialogVisible: false,
	selTopic: null,
	topics: [

	],
	rowData: null,


});

const tablePage = reactive({
	pageNumber: 1, // 第几页
	pageSize: 5, // 每页多少条
	total: 0, // 总记录数
	pageSizes: [5, 10, 15, 20]
},
)

const tablePageMine = reactive({
	pageNumber: 1, // 第几页
	pageSize: 5, // 每页多少条
	total: 0, // 总记录数
	pageSizes: [5, 10, 15, 20]
},
)

const tablePageLog = reactive({
	pageNumber: 1, // 第几页
	pageSize: 5, // 每页多少条
	total: 0, // 总记录数
	pageSizes: [5, 10, 15, 20]
},
)


const handlePageLogChange = (currentPage) => {
	tablePageLog.pageNumber = currentPage
	getExecuLog()
}
const handleSizeLogChange = (pageSize) => {
	tablePageLog.pageSize = pageSize
	getExecuLog()
}

const handlePageMineChange = (currentPage) => {
	tablePageMine.pageNumber = currentPage
	getMineTask()
}
const handleSizeMineChange = (pageSize) => {
	tablePageMine.pageSize = pageSize
	getMineTask()
}

const handlePageChange = (currentPage) => {
	tablePage.pageNumber = currentPage
	getUploadTask()
}
const handleSizeChange = (pageSize) => {
	tablePage.pageSize = pageSize
	getUploadTask()
}

const addTask = (val) => {
	taskApi().addMineTask(val).then(() => {
		ElMessage.success('操作成功')
		getMineTask()
	}).catch(() => {
		ElMessage.success('操作失败')
	}
	)
}

const del = (val) => {
	ElMessageBox.alert('确认删除', '提示', {
		// if you want to disable its autofocus
		// autofocus: false,
		confirmButtonText: '确认',
		callback: (action) => {
			if (action == 'confirm') {
				taskApi().delUploadTask(val.id).then(() => {
					ElMessage.success('操作成功');
					getUploadTask()
				}).catch(() => {
					ElMessage.success('操作失败')
				}
				)

			}

		},
	});
}

const delMine = (val) => {
	ElMessageBox.alert('确认删除', '提示', {
		// if you want to disable its autofocus
		// autofocus: false,
		confirmButtonText: '确认',
		callback: (action) => {
			if (action == 'confirm') {
				taskApi().delMineTask(val.id).then(() => {
					ElMessage.success('操作成功');
					getMineTask()
				}).catch(() => {
					ElMessage.success('操作失败')
				}
				)

			}

		},
	});
}

onMounted(() => {
	getUploadTask()
	getMineTask()
	getExecuLog()
})

const getUploadTask = () => {
	config.tableUploadLoading = true
	taskApi().getUploadTask(tablePage).then((res) => {
		if (res.data) {
			form.uploadTaskResult = []
			form.uploadTaskResult = res.data.records
			tablePage.pageNumber = res.data.pageNumber
			tablePage.pageSize = res.data.pageSize
			tablePage.total = res.data.totalRow
		}
		config.tableUploadLoading = false
	}).catch(() => {
		config.tableUploadLoading = false
		ElMessage.success('操作失败')
	}
	)
}

const getMineTask = () => {
	config.tableMineLoading = true
	taskApi().getMineTask(tablePageMine).then((res) => {
		if (res.data) {
			form.myTaskResult = []
			form.myTaskResult = res.data.records
			tablePageMine.pageNumber = res.data.pageNumber
			tablePageMine.pageSize = res.data.pageSize
			tablePageMine.total = res.data.totalRow
		}
		config.tableMineLoading = false
	}).catch(() => {
		config.tableMineLoading = false
		ElMessage.success('操作失败')
	}
	)
}


const getExecuLog = () => {
	config.tableLogLoading = true
	taskApi().getExecuLog(tablePageLog).then((res) => {
		if (res.data) {
			form.exeLog = res.data.records
			tablePageLog.pageNumber = res.data.pageNumber
			tablePageLog.pageSize = res.data.pageSize
			tablePageLog.total = res.data.totalRow
		}
		config.tableLogLoading = false
	}).catch(() => {
		config.tableLogLoading = false
		ElMessage.success('操作失败')
	}
	)
}
const execTask = (val, loadingType) => {
	if (!val.uploadClient) {
		ElMessage.error('执行通道为空')
		return
	}
	if (val.type == 2) {
		taskApi().downloadTask(val).then(() => {
			ElMessage.success('操作成功');
			form.dialogVisible = false
		}).catch(() => {
			ElMessage.error('操作失败')
		}
		)
	}
	else {
		config[loadingType + val.id] = true
		taskApi().doUploadTask(val).then((res) => {
			if (res.code == 200) {
				ElMessage.success('执行成功');
			} else {
				ElMessage.error('执行失败');
			}
			form.dialogVisible = false
			config[loadingType + val.id] = false
			getExecuLog()

		}).catch(() => {
			ElMessage.error('操作失败')
			config[loadingType + val.id] = false
			getExecuLog()
		}
		)
	}

}
const execTaskAndTopic = (val, type) => {
	payApi().getAllTopic().then((res) => {
		form.topics = []
		form.topics = res.data
	})
	form.dialogVisible = true
	form.rowData = val
	form.rowData.type = type
	form.rowData['uploadClient'] = form.selTopic
}
const selChange = () => {
	form.rowData['uploadClient'] = form.selTopic
}


</script>
<style>
.dialogBtn {
	float: right;
	margin-top: 20px;
}

.el-dialog header span {
	font-size: 14px;
}

.el-collapse button {
	padding-left: 10px;
}

.pagination {
	margin-top: 10px;
}

.parent_card {
	display: inline-flex;
	margin-right: 10px;
}

.card {
	width: 400px;
	height: 250px;
	display: flex;
	flex-direction: column;
	position: relative;
}

.btn {
	margin-left: auto;
	margin-top: auto;
}


.image {
	float: right;
	width: 100px;
	position: absolute;
	right: 0px;
}

.card .image img {
	width: 100px;
	height: 100px;

}

.el-collapse-item h4 {
	margin: 10px;
}
</style>
