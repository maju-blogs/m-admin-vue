<template>
	<el-dialog :width="600" v-model="propData.propData.dialogFormVisible" title="脚本管理">
		<el-form ref="ruleFormRef" status-icon :rules="rules" :model="form" label-width="80px" label-position="left">
			<el-form-item v-if="propData.propData.nodeData && propData.propData.type != 3" label="上级名称">
				<el-input :disabled="true" v-model="form.parentFileName" />
			</el-form-item>
			<el-form-item label="脚本别名" prop="name">
				<el-input placeholder="中文备注名称" v-model="form.name" />
			</el-form-item>
			<el-form-item label="脚本名称" prop="fileName">
				<el-input placeholder="脚本名称或者文件夹名称" v-model="form.fileName" />
			</el-form-item>
			<el-form-item label="脚本编码">
				<el-input :disabled="true" placeholder="脚本名称或者文件夹唯一编号" v-model="form.code" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSubmit(ruleFormRef)">提交</el-button>
				<el-button @click="canle">取消</el-button>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>
  
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { pythonApi } from '/@/api/python/index'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus';

const ruleFormRef = ref<FormInstance>()

const propData = defineProps(['propData']);
const emit = defineEmits(['flushMenu'])


// do not use same name with ref
const form = reactive({
	nodeData: null,
	id: null,
	code: null,
	level: 1,
	parent: 0,
	name: '',
	fileName: null,
	parentFileName: null,
	parentName: null,
	type: 0,
});


const rules = reactive<FormRules>({
	name: [
		{ required: true, message: '请输入中文备注名称', trigger: 'blur' },
	],
	fileName: [
		{ required: true, message: '请输入脚本名称或者文件夹名称', trigger: 'blur' },
		{ pattern: /^[a-zA-Z0-9\.]{1,10}/, message: '请输入字母或者数字', trigger: 'blur' },
	]
})
watch(propData, () => {
	form.name = '';
	form.fileName = null;
	form.parentName = null;
	if (propData.propData.type == 1) {
		form.type = 1
		if (propData.propData.nodeData) {
			form.parent = propData.propData.nodeData.data.id;
			form.parentFileName = propData.propData.nodeData.data.fileName;
			form.level = propData.propData.nodeData.data.level + 1;
		}
	} else if (propData.propData.type == 2) {
		form.type = 2
		if (propData.propData.nodeData) {
			form.parent = propData.propData.nodeData.data.id;
			form.parentFileName = propData.propData.nodeData.data.fileName;
			form.level = propData.propData.nodeData.data.level + 1;
		}
	} else if (propData.propData.type == 3) {
		form.name = propData.propData.nodeData.data.name;
		form.fileName = propData.propData.nodeData.data.fileName;
		form.code = propData.propData.nodeData.data.code;
		form.id = propData.propData.nodeData.data.id;
		form.parent = NaN
	}
})


const onSubmit = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid, fields) => {
		if (valid) {

			if (propData.propData.type == 3) {
				pythonApi().update(form).then(() => {
					ElMessage.success('操作成功');
					propData.propData.dialogFormVisible = false
					emit('flushMenu')
				})
			} else {
				pythonApi().save(form).then(() => {
					ElMessage.success('操作成功');
					propData.propData.dialogFormVisible = false
					emit('flushMenu')
				})
			}

		}
	})
}
const canle = () => {
	propData.propData.dialogFormVisible = false

};
</script>

<style></style>
  