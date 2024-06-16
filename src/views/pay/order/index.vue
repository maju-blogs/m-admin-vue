<template>
	<div class="system-dic-container layout-padding mb-4">
		<el-row>
			<el-col>
				<el-table :data="resultData.rows" border v-loading="config.tableLoading" element-loading-text="数据正在加载中"
					element-loading-spinner="el-icon-loading">
					<el-table-column prop="id" label="主键" width="80">
					</el-table-column>
					<el-table-column prop="payId" label="支付流水号" width="200">
					</el-table-column>
					<el-table-column prop="payUserName" label="支付姓名" width="100">
					</el-table-column>
					<el-table-column prop="payAmount" label="支付金额" width="100">
					</el-table-column>
					<el-table-column prop="payDesc" label="支付描述" width="200">
					</el-table-column>
					<el-table-column prop="payStatusName" label="支付状态" width="100">
						<template #default="scope">
							<span v-if="scope.row.payStatus == 2" style="color: green;">支付成功</span>
							<span v-if="scope.row.payStatus == 3" style="color: red;">支付失败</span>
						</template>
					</el-table-column>
					<el-table-column prop="payTime" label="支付时间" width="150">
					</el-table-column>
					<el-table-column prop="payTypeName" label="支付方式" width="100">
					</el-table-column>
					<el-table-column prop="createTime" label="创建时间" width="150">
					</el-table-column>
					<el-table-column fixed="right" label="操作" width="300">
						<template #default="scope">
							<el-button size="small"
								@click="config.dialogVisible = true, manualOrder(scope.row), config.type = 2"
								plain>手动确认</el-button>
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
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { payApi } from '/@/api/pay/index'

const resultData = reactive({
	rows: null,

})

const config = reactive({
	dialogVisible: false,
	tableLoading: true,
	selData: null,
	type: 1,
})
// do not use same name with ref
const form = reactive({
	id: null,
});


const tablePage = reactive({
	pageNumber: 1, // 第几页
	pageSize: 5, // 每页多少条
	total: 0, // 总记录数
	pageSizes: [5, 10, 15, 20]
},
)

const manualOrder = (val) => {
	form.id = val.id
	payApi().manualOrder(form).then(() => {
		ElMessage.success('操作成功');
		getOrderPage()
	}).catch(() => {
		ElMessage.error('操作失败');
	})
}



const handlePageChange = (currentPage) => {
	tablePage.pageNumber = currentPage
	getOrderPage()
}
const handleSizeChange = (pageSize) => {
	tablePage.pageSize = pageSize
	getOrderPage()
}

const del = (val) => {
	ElMessageBox.alert('确认删除', '提示', {
		// if you want to disable its autofocus
		// autofocus: false,
		confirmButtonText: '确认',
		callback: (action: Action) => {
			if (action == 'confirm') {
				payApi().delOrder(val.id).then(() => {
					ElMessage.success('操作成功');
					getOrderPage()
				})

			}

		},
	});
}


onMounted(() => {
	getOrderPage()
})


const getOrderPage = () => {
	config.tableLoading = true
	payApi().getOrderPage(tablePage).then((res) => {
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
