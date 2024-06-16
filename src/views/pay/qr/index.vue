<template>
	<div class="system-dic-container layout-padding mb-4">
		<div>
			<el-button type="primary" size="default"
				style="width: 80px; margin-bottom: 20px; margin-right: 20px; float: right; position: relative;"
				@click="form.dialogFormVisible = true, form.type = 1, form.selData = null">新增</el-button>
			<el-button type="primary" size="default"
				style="width: 80px; margin-bottom: 20px;margin-right: 20px; float: right; position: relative;"
				@click="ocrForm.dialogFormVisible = true">OCR配置</el-button>

		</div>
		<el-table :data="form.tableData" border style="width: 100%" v-loading="config.tableLoading"
			element-loading-text="数据正在加载中" element-loading-spinner="el-icon-loading">
			>
			<el-table-column fixed prop="id" label="主键" width="80">
			</el-table-column>
			<el-table-column prop="payAmount" label="支付金额" width="100">
			</el-table-column>
			<el-table-column prop="qrBase64" label="二维码" width="150">
				<template #default="scope">
					<el-image style="width: 100px; height: 100px" @click="showImg(scope.row.qrBase64)"
						:src="scope.row.qrBase64">
					</el-image>
				</template>
			</el-table-column>
			<el-table-column prop="qrOldBase64" label="原始二维码" width="200">
				<template #default="scope">
					<el-image style="width: 100px; height: 100px" @click="showImg(scope.row.qrOldBase64)"
						:src="scope.row.qrOldBase64">
					</el-image>
				</template>
			</el-table-column>
			<el-table-column prop="qrMark" label="二维码备注号" width="150">
			</el-table-column>
			<el-table-column prop="desc" label="描述" width="150">
			</el-table-column>
			<el-table-column prop="qrType" label="支付类型" width="100">
				<template #default="scope">
					<span v-if="scope.row.qrType == 1">微信</span>
					<span v-if="scope.row.qrType == 2">支付宝</span>
				</template>
			</el-table-column>
			<el-table-column prop="qrLogoType" label="美化方式" width="100">
				<template #default="scope">
					<span v-if="scope.row.qrLogoType == 0">默认</span>
					<span v-if="scope.row.qrLogoType == 1">微信</span>
					<span v-if="scope.row.qrLogoType == 2">支付宝</span>
				</template>
			</el-table-column>
			<el-table-column prop="createTime" label="创建时间" width="200">
			</el-table-column>
			<el-table-column fixed="right" label="操作" width="300">
				<template #default="scope">
					<el-button size="small" @click="form.dialogFormVisible = true, form.type = 2, form.selData = scope.row"
						plain>修改</el-button>
					<el-button type="danger" plain size="small" @click="del(scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="pagination">
			<el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="tablePage.pageNumber"
				:page-size="tablePage.pageSize" :page-sizes="tablePage.pageSizes" :total="tablePage.total"
				@size-change="handleSizeChange" @current-change="handlePageChange" />
		</div>
		<qrFrom @closeChild="closeChild" :selData="form.selData" :dialogFormVisible="form.dialogFormVisible"
			:type="form.type" />

		<el-dialog title="选择执行通道" v-model="form.imgVisible" width="20%">
			<el-image style="width: 100%; height: 100%" :src="form.img">
			</el-image>
		</el-dialog>
		<el-dialog title="OCR配置" v-model="ocrForm.dialogFormVisible" width="30%">
			<el-form ref="ruleFormRef" status-icon :model="ocrForm" :rules="rules" label-width="200px"
				label-position="left">
				<el-form-item prop="bdOrcClientId" label="百度client_id">
					<el-input placeholder="百度client_id" v-model="ocrForm.bdOrcClientId" />
				</el-form-item>
				<el-form-item prop="bdOcrClientSecret" label="百度client_secret">
					<el-input placeholder="百度client_secret" v-model="ocrForm.bdOcrClientSecret" />
				</el-form-item>
				<el-form-item style="float:right">
					<el-button size="default" type="primary" @click="onSubmit(ruleFormRef)">提交</el-button>
					<el-button size="default" @click="canle">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted, defineAsyncComponent, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus'
import { qrApi } from '/@/api/pay/qrIndex'
import { useLoginApi } from '/@/api/login/index'
const ruleFormRef = ref<FormInstance>()

const qrFrom = defineAsyncComponent(() => import('/@/views/pay/qr/component/qrFrom.vue'));

const config = reactive({
	tableLoading: true

});


// do not use same name with ref
const form = reactive({
	dialogFormVisible: false,
	imgVisible: false,
	type: 0,
	tableData: [],
	img: null,
	selData: null

});

const ocrForm = reactive({
	dialogFormVisible: false,
	bdOrcClientId: null,
	bdOcrClientSecret: null,
});

const tablePage = reactive({
	pageNumber: 1, // 第几页
	pageSize: 5, // 每页多少条
	total: 0, // 总记录数
	pageSizes: [5, 10, 15, 20]
},
)


const rules = reactive<FormRules>({
	bdOrcClientId: [
		{ required: true, message: '请输入clientId', trigger: 'blur' },
	],
	bdOcrClientSecret: [
		{ required: true, message: '请输入clientSecret', trigger: 'blur' },
	]

})


const onSubmit = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid) => {
		if (!valid) {
			return
		}

		useLoginApi().updateOcr(ocrForm).then(() => {
			ElMessage.success("操作成功")
		}).catch(() => {
			ElMessage.error("操作失败")
		})

	})

}
const canle = () => {
	ocrForm.dialogFormVisible = false
};

const handlePageChange = (currentPage) => {
	tablePage.pageNumber = currentPage
	getAllQr()
}
const handleSizeChange = (pageSize) => {
	tablePage.pageSize = pageSize
	getAllQr()
}
const closeChild = (val) => {
	form.dialogFormVisible = val
	getAllQr()
}
const showImg = (val) => {
	form.imgVisible = true
	form.img = val
}

const del = (val) => {
	ElMessageBox.alert('确认删除', '提示', {
		// if you want to disable its autofocus
		// autofocus: false,
		confirmButtonText: '确认',
		callback: (action) => {
			if (action == 'confirm') {
				qrApi().delQr(val.id).then(() => {
					ElMessage.success('操作成功');
					getAllQr()
				}).catch(() => {
					ElMessage.success('操作失败')
				}
				)

			}

		},
	});
}


onMounted(() => {
	getAllQr()
})

const getAllQr = () => {
	qrApi().getAllQr(tablePage).then((res) => {
		if (res.data) {
			form.tableData = []
			form.tableData = res.data.records
			tablePage.pageNumber = res.data.pageNumber
			tablePage.pageSize = res.data.pageSize
			tablePage.total = res.data.totalRow
		}
		config.tableLoading = false
	}).catch(() => {
		config.tableLoading = false
		ElMessage.success('操作失败')
	}
	)
}

</script>
<style>
.el-image {
	cursor: pointer
}

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
