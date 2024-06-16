<template>
	<el-dialog :width="600" v-model="props.dialogFormVisible" :before-close="canle" title="设备管理">
		<el-form ref="ruleFormRef" status-icon :model="form" :rules="rules" label-width="80px" label-position="left">
			<el-form-item label="连接ID">
				<el-input placeholder="连接ID" disabled v-model="form.clientId" />
			</el-form-item>
			<el-form-item label="连接地址">
				<el-input placeholder="连接地址" disabled v-model="form.clientIP" />
			</el-form-item>
			<el-form-item label="连接名称" prop="clientName">
				<el-input placeholder="连接名称" minlength="10" v-model="form.clientName" />
			</el-form-item>
			<el-form-item label="描述">
				<el-input placeholder="描述" v-model="form.clientDesc" />
			</el-form-item>
			<el-form-item style="float:right">
				<el-button type="primary" @click="onSubmit(ruleFormRef)">提交</el-button>
				<el-button @click="canle">取消</el-button>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>
  
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { payApi } from '/@/api/pay/index'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus';
import { defineProps } from 'vue';

const ruleFormRef = ref<FormInstance>()
const emits = defineEmits(['closeChild'])

const props = defineProps({
	selData: Object,
	dialogFormVisible: Boolean,
	type: Number
});

// do not use same name with ref
const form = reactive({
	dialogFormVisible: false,
	clientId: null,
	clientIP: null,
	clientName: null,
	clientDesc: null,
	clientType: null,
	id: null,

});

watch(props, () => {
	form.clientId = props.selData.clientId
	form.clientIP = props.selData.clientIP
	form.clientName = props.selData.clientName
	form.clientDesc = props.selData.clientDesc
	form.clientType = props.selData.clientType
	form.id = props.selData.id
})

const rules = reactive<FormRules>({
	clientName: [
		{ required: true, message: '请输入连接名称', trigger: 'blur' },
	]
})


const onSubmit = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid) => {
		if (valid) {
			if (props.type == 0) {
				payApi().addDevice(form).then(() => {
					ElMessage.success('操作成功');
					emits("closeChild", false)
				}).catch(() => {
					ElMessage.error('操作失败');
				})
			} else {
				payApi().updateDevice(form).then(() => {
					ElMessage.success('操作成功');
					emits("closeChild", false)
				}).catch(() => {
					ElMessage.error('操作失败');
				})
			}


		}
	})

}
const canle = () => {
	emits("closeChild", false)
};
</script>

<style></style>
  