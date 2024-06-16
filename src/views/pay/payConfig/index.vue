<template>
	<div class="system-dic-container layout-padding mb-4">
		<el-row>
			<el-col>
				<div style="float: right; margin: 20px;">
					<el-button type="primary" size="default" @click="config.dialogVisible = true" plain>新增</el-button>
					<a style="margin-left: 20px;" :href="config.orderUrl">支付体验</a>

				</div>

				<el-table :data="resultData.rows" border v-loading="config.tableLoading" element-loading-text="数据正在加载中"
					element-loading-spinner="el-icon-loading">
					<el-table-column prop="id" label="主键" width="80">
					</el-table-column>
					<el-table-column prop="payTypeName" label="支付方式" width="120">
					</el-table-column>
					<el-table-column prop="payType" v-if="false" label="支付方式" width="80">
					</el-table-column>
					<el-table-column prop="taskName" label="支付任务" width="100">
					</el-table-column>
					<el-table-column prop="taskId" v-if="false" label="支付任务" width="120">
					</el-table-column>
					<el-table-column prop="clientName" label="支付手机" width="200">
					</el-table-column>
					<el-table-column prop="clientId" v-if="false" label="支付手机" width="200">
					</el-table-column>
					<el-table-column prop="payTopic" label="支付通道" width="200">
					</el-table-column>
					<el-table-column prop="payTimeOut" label="超时时间(s)">
					</el-table-column>
					<el-table-column prop="regex" label="备注号匹配正则" width="300">
					</el-table-column>
					<el-table-column fixed="right" label="操作" width="300">
						<template #default="scope">
							<el-button size="small"
								@click="config.dialogVisible = true, copyData(scope.row), config.type = 2"
								plain>修改</el-button>
							<el-button type="danger" plain size="small" @click="del(scope.row)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
		</el-row>

		<div class="pagination">
			<el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="tablePage.pageNumber"
				:page-size="tablePage.pageSize" :page-sizes="tablePage.pageSizes" :total="tablePage.total"
				@size-change="handleSizeChange" @current-change="handlePageChange" />
		</div>
		<el-dialog title="支付类型配置" v-model="config.dialogVisible" width="30%">
			<el-form ref="ruleFormRef" status-icon :model="form" :rules="rules" label-width="100px" label-position="left">
				<el-form-item prop="payType" label="支付方式">
					<el-select v-model="form.payType">
						<el-option v-for="item in payType" :key="item.type" :label="item.name" :value="item.type">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="taskId" label="支付任务">
					<el-select v-model="form.taskId">
						<el-option v-for="item in payTask" :key="item.taskId" :label="item.taskName" :value="item.taskId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="clientId" label="支付手机">
					<el-select v-model="form.clientId" :change="getClientInfo(form.clientId)">
						<el-option v-for="item in payClient" :key="item.clientId" :label="item.clientName"
							:value="item.clientId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="payTopic" label="支付通道">
					<el-select v-model="form.payTopic">
						<el-option v-for="item in topics.array" :key="item" :label="item" :value="item">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="payTimeOut" label="超时时间(s)">
					<el-input placeholder="支付超时时间" v-model="form.payTimeOut" />
				</el-form-item>
				<el-form-item prop="regex" label="备注号匹配正则">
					<el-input placeholder="备注号匹配正则" v-model="form.regex" />
				</el-form-item>
				<el-form-item style="float:right">
					<el-button type="primary" size="default" @click="onSubmit(ruleFormRef)">提交</el-button>
					<el-button @click="canle" size="default">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus'
import { payApi } from '/@/api/pay/index'
import { qrApi } from '/@/api/pay/qrIndex'
import { taskApi } from '/@/api/task/index'


const payType = reactive([
])
const payTask = reactive([
])
const payClient = reactive([
])

const topics = reactive({
	array: [],
}
)

const resultData = reactive({
	rows: null,

})

const config = reactive({
	dialogVisible: false,
	tableLoading: true,
	selData: null,
	type: 1,
	orderUrl: import.meta.env.VITE_PUBLIC_PATH + '/order.html'
})
// do not use same name with ref
const form = reactive({
	id: null,
	payType: null,
	clientId: null,
	payTimeOut: 60,
	taskId: null,
	regex: null,
	payTopic: null,

});


const tablePage = reactive({
	pageNumber: 1, // 第几页
	pageSize: 5, // 每页多少条
	total: 0, // 总记录数
	pageSizes: [5, 10, 15, 20]
},
)

const copyData = (val) => {
	form.id = val.id
	form.clientId = val.clientId
	form.payType = val.payType
	form.payTimeOut = val.payTimeOut
	form.taskId = val.taskId
	form.regex = val.regex
	form.payTopic = val.payTopic

}


const canle = () => {
	config.dialogVisible = false
	form.id = null
	form.payType = null
	form.clientId = null
	form.payTimeOut = 60
	form.taskId = null
	form.regex = null
	form.payTopic = null
}

const handlePageChange = (currentPage) => {
	tablePage.pageNumber = currentPage
	getAllPayConfPage()
}
const handleSizeChange = (pageSize) => {
	tablePage.pageSize = pageSize
	getAllPayConfPage()
}

const getClientInfo = (clientId) => {
	if (clientId) {
		payApi().getClientInfo({ clientId: clientId }).then((res) => {
			topics.array = res.data.topic.split(",")
		})
	}

}

const del = (val) => {
	ElMessageBox.alert('确认删除', '提示', {
		// if you want to disable its autofocus
		// autofocus: false,
		confirmButtonText: '确认',
		callback: (action: Action) => {
			if (action == 'confirm') {
				payApi().delPayConf(val.id).then(() => {
					ElMessage.success('操作成功');
					getAllPayConfPage()
				})

			}

		},
	});
}

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules>({

	payType: [
		{ required: true, message: '请选择支付类型', trigger: 'blur' },
	],
	taskId: [
		{ required: true, message: '请选择支付任务', trigger: 'blur' },
	],
	clientId: [
		{ required: true, message: '请选择支付手机', trigger: 'blur' },
	],
	payTimeOut: [
		{ required: true, message: '请输入支付超时时间', trigger: 'blur' },
	],
	regex: [
		{ required: true, message: '匹配正则不能为空', trigger: 'blur' },
	],
	payTopic: [
		{ required: true, message: '支付通道不能为空', trigger: 'blur' },
	],
})


const onSubmit = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid) => {
		if (!valid) {
			return
		}
		if (config.type == 1) {
			payApi().addPayConf(form).then(() => {
				ElMessage.success("操作成功")
				config.dialogVisible = false
				getAllPayConfPage()
			}).catch(() => {
				ElMessage.error("操作失败")
				config.dialogVisible = false
			})
		} else {
			payApi().updatePayConf(form).then(() => {
				ElMessage.success("操作成功")
				config.dialogVisible = false
				getAllPayConfPage()
			}).catch(() => {
				ElMessage.error("操作失败")
				config.dialogVisible = false
			})
		}

	})

}


onMounted(() => {
	getAllPayConfPage()
	getAllQrType()
	listMineTask()
	getAllClient()
})


const getAllClient = () => {
	payApi().getAllClient().then((res) => {
		if (res.data) {
			res.data.forEach(ele => {
				if (ele['add'] == 1 && ele['clientType'] == 0) {
					payClient.push(ele)
				}
			});
		}

	}).catch()
}

const getAllQrType = () => {
	qrApi().getAllQrType().then((res) => {
		for (let i in res.data) {
			if (res.data[i].type != 0) {
				payType.push(res.data[i])
			}
		}

	}).catch(() => {
		ElMessage.error('操作失败');
	})
}

const listMineTask = () => {
	taskApi().listMineTask().then((res) => {
		for (let i in res.data) {
			if (res.data[i].type != 0) {
				payTask.push(res.data[i])
			}
		}

	}).catch(() => {
		ElMessage.error('操作失败');
	})
}

taskApi

const getAllPayConfPage = () => {
	config.tableLoading = true
	payApi().getAllPayConfPage(tablePage).then((res) => {
		if (res.data) {
			resultData.rows = res.data.records
			tablePage.pageNumber = res.data.pageNumber
			tablePage.pageSize = res.data.pageSize
			tablePage.total = res.data.totalRow
		}
		config.tableLoading = false
	}).catch(() => {
		config.tableLoading = false
		ElMessage.error('操作失败');
	})
}

</script>
<style></style>
