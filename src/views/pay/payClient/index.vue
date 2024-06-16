<template>
	<div class="system-dic-container layout-padding mb-4">
		<el-collapse v-model="form.activeNames" class="collapse">
			<el-collapse-item title="发现设备" name="1">
				<h4 v-if="form.notAdd.length == 0">暂无设备</h4>
				<div class="parent_card" v-for="one in form.notAdd">
					<el-card class="el_card" :body-style="{ padding: '10px' }">
						<div class="card" style="height: 200px;">
							<div class="image">
								<img src="/@/assets/phone.svg">
							</div>
							<div class="clearfix">
								<div>
									<span>连接ID: </span><span>{{ one.clientId }}</span>
								</div>
								<div>
									<span>连接地址: </span><span>{{ one.clientIP }}</span>
								</div>
								<div>
									<span>连接类型: </span><span v-if="one.clientType == 1">服务端</span><span
										v-if="one.clientType == 0">客户端</span>
								</div>
								<div>
									<span>状态: </span><span style="color: #67C23A;">在线</span>
								</div>
								<div style="margin-top: 10px;">
									<span>订阅地址: </span><span>{{ one.topics }}</span>
								</div>
							</div>
							<div class="btn">
								<el-button @click="add(one)" type="primary" size="small">添加</el-button>
							</div>
						</div>
					</el-card>
				</div>
			</el-collapse-item>
		</el-collapse>
		<PhoneFrom @closeChild="closeChild" :selData="form.selData" :dialogFormVisible="form.dialogFormVisible"
			:type="form.type" />
		<el-collapse v-model="form.activeNamesAdd" @change="handleChange" class="collapse">
			<el-collapse-item title="已添加设备" name="1">
				<h4 v-if="form.add.length == 0">暂无设备</h4>
				<div class="parent_card" v-for="one in form.add">
					<el-card :body-style="{ padding: '10px' }">
						<div class="card">
							<div class="image">
								<img src="/@/assets/phone.svg">
							</div>
							<div class="clearfix">
								<div>
									<span>连接名称: </span><span>{{ one.clientName }}</span>
								</div>
								<div>
									<span>连接ID: </span><span>{{ one.clientId }}</span>
								</div>
								<div>
									<span>连接地址: </span><span>{{ one.clientIP }}</span>
								</div>
								<div>
									<span>连接类型: </span><span v-if="one.clientType == 1">服务端</span><span
										v-if="one.clientType == 0">客户端</span>
								</div>
								<div>
									<span>描述: </span><span>{{ one.clientDesc }}</span>
								</div>
								<div>
									<span>添加时间: </span><span>{{ one.createTime }}</span>
								</div>
								<div>
									<span>状态: </span><span v-if="one.online == 1" style="color: #67C23A;">在线</span><span
										v-if="one.online == 0" style="color: #F56C6C;">离线</span>
								</div>
								<div>
									<span>订阅地址: </span><span>{{ one.topics }}</span>
								</div>
							</div>
							<div class="btn">
								<el-button @click="update(one)" type="primary" size="small">修改</el-button>
								<el-button plain @click="del(one)" type="danger" size="small">删除</el-button>
							</div>
						</div>
					</el-card>
				</div>
			</el-collapse-item>
		</el-collapse>
		<div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { payApi } from '/@/api/pay/index'
const PhoneFrom = defineAsyncComponent(() => import('/@/views/pay/payClient/component/phoneFrom.vue'));


// do not use same name with ref
const form = reactive({
	currentDate: new Date(),
	activeNames: ['1'],
	activeNamesAdd: ['1'],
	notAdd: [],
	add: [],

	oneDevice: {
		add: "0",
		clientDesc: "0",
	},
	selData: null,
	dialogFormVisible: false,
	type: 0,

});

const closeChild = (val) => {
	form.dialogFormVisible = val
	getAllClient()
}

const add = (val) => {
	form.dialogFormVisible = false
	form.selData = val
	form.dialogFormVisible = true
	form.type = 0
}
const update = (val) => {
	form.dialogFormVisible = false
	form.selData = val
	form.dialogFormVisible = true
	form.type = 1

}
const del = (val) => {
	ElMessageBox.alert('确认删除', '提示', {
		// if you want to disable its autofocus
		// autofocus: false,
		confirmButtonText: '确认',
		callback: (action: Action) => {
			if (action == 'confirm') {
				payApi().delDevice(val.id).then((res) => {
					ElMessage.success('操作成功');
					getAllClient()
				})

			}

		},
	});
}

onMounted(() => {
	getAllClient()
})

const getAllClient = () => {
	payApi().getAllClient().then((res) => {
		if (res.data) {
			form.notAdd = []
			form.add = []
			res.data.forEach(ele => {
				if (ele['add'] === 0) {
					form.notAdd.push(ele)
				} else {
					form.add.push(ele)
				}
			});
		}

	}).catch()
}

setInterval(getAllClient, 5000)

</script>
<style>
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
