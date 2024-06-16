<template>
	<div class="system-dic-container layout-padding mb-4">
		<div>
			<el-row class="mb-4">
				<el-button plain @click="edit">编辑</el-button>
			</el-row>
		</div>
		<el-form :model="form" label-width="200px">
			<el-form-item label="python安装路径">
				<el-col :span="6">
					<el-input :disabled="form.disabled" v-model="form.pythonBin" />
				</el-col>
			</el-form-item>
			<el-form-item label="脚本存放目录">
				<el-col :span="6">
					<el-input :disabled="form.disabled" v-model="form.pythonPath" />
				</el-col>
			</el-form-item>
			<el-form-item label="脚本名称">
				<el-col :span="6">
					<el-input :disabled="form.disabled" v-model="form.pythonName" />
				</el-col>
			</el-form-item>
			<el-form-item label="chromium安装路径">
				<el-col :span="6">
					<el-input :disabled="form.disabled" v-model="form.chromiumPath" />
				</el-col>
			</el-form-item>
			<el-divider />
			<el-form-item label="gitee仓库地址">
				<el-col :span="6">
					<el-input :disabled="form.disabled" v-model="form.giteeAddress" />
				</el-col>
			</el-form-item>
			<el-form-item label="gitee仓库分支">
				<el-col :span="6">
					<el-input :disabled="form.disabled" v-model="form.giteeBranch" show-password />
				</el-col>
			</el-form-item>
			<el-form-item label="gitee账号">
				<el-col :span="4">
					<el-input :disabled="form.disabled" v-model="form.giteeAccount" />
				</el-col>
			</el-form-item>
			<el-form-item label="gitee密码">
				<el-col :span="4">
					<el-input :disabled="form.disabled" type="password" v-model="form.giteePassword" show-password />
				</el-col>
			</el-form-item>
			<el-divider />
			<el-form-item :inline="true" label="微信开发者id">
				<el-col :span="4">
					<el-input :disabled="form.disabled" v-model="form.wxAppId" />
				</el-col>
			</el-form-item>
			<el-form-item :inline="true" label="微信开发者secert">
				<el-col :span="4">
					<el-input :disabled="form.disabled" v-model="form.wxAppSecret" />
				</el-col>
			</el-form-item>
			<el-form-item :inline="true" label="微信回调token">
				<el-col :span="4">
					<el-input :disabled="form.disabled" v-model="form.wxToken" />
				</el-col>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSubmit">提交</el-button>
				<el-button>取消</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { configApi } from '/@/api/config/index'
// do not use same name with ref
const form = reactive({
	pythonPath: '',
	pythonBin: '',
	pythonName: '',
	chromiumPath: '',
	giteeAccount: '',
	giteePassword: '',
	giteeAddress: '',
	giteeBranch: '',
	wxAppId: '',
	id: 1,
	wxAppSecret: '',
	wxToken: '',

	disabled: true,
	isAdd: false,
});

const edit = () => {
	form.disabled = false
};

const onSubmit = () => {
	if (form.isAdd) {
		configApi().save(form).then((res) => {
			ElMessage.success("保存成功！")
			form.disabled = true
		}).catch(e => {
			ElMessage.error("保存失败！")
		})
	} else {
		configApi().update(form).then((res) => {
			ElMessage.success("保存成功！")
			form.disabled = true
		}).catch(e => {
			ElMessage.error("保存失败！")
		})
	}
};

onMounted(() => {
	configApi().getInfo(1).then((res) => {
		if (res.data) {
			console.log(res.data);
			form.pythonPath = res.data.pythonPath
			form.pythonBin = res.data.pythonBin
			form.pythonName = res.data.pythonName
			form.chromiumPath = res.data.chromiumPath
			form.giteeAccount = res.data.giteeAccount
			form.giteePassword = res.data.giteePassword
			form.giteeAddress = res.data.giteeAddress
			form.giteeBranch = res.data.giteeBranch
			form.wxAppId = res.data.wxAppId
			form.wxAppSecret = res.data.wxAppSecret
			form.id = res.data.id
			form.wxToken = res.data.wxToken
			form.isAdd = false
		} else {
			form.isAdd = true
		}

	}).catch()
})
</script>
<style>
.edit {}
</style>
