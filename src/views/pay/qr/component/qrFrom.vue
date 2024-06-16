<template>
	<el-dialog :width="600" v-model="form.dialogFormVisible" :before-close="canle" title="二维码">
		<el-form ref="ruleFormRef" status-icon :model="form" :rules="rules" label-width="100px" label-position="left">
			<el-form-item prop="payAmount" label="支付金额">
				<el-input placeholder="支付金额" v-model="form.payAmount" />
			</el-form-item>
			<el-form-item prop="qrOldBase64" label="支付二维码">
				<!-- <el-upload action="" list-type="picture-card" :file-list="form.fileList" :multiple="false" :limit="1" drag
					:auto-upload="false" :on-change="myUpload">
					<el-icon>
						<ele-Plus />
					</el-icon>
				</el-upload> -->
				<el-upload class="upload-demo" drag action="" list-type="picture-card" :file-list="form.fileList"
					:auto-upload="false" :on-change="myUpload" :limit="1">
					<i class="el-icon-upload"></i>
					<div style="margin-top: -20px;" class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
					<div @slot="tip">请上传原收款码</div>
				</el-upload>
				<el-dialog>
					<img width="50%" alt="">
				</el-dialog>
			</el-form-item>
			<div v-if="ocrData.result" style="margin-bottom: 10px; padding: 20px; background-color: #E6A23C">
				<p>{{ ocrData.result }}</p>
			</div>
			<el-form-item prop="qrType" label="支付类型">
				<el-select v-model="form.qrType">
					<el-option v-for="item in payType" :key="item.type" :label="item.name" :value="item.type">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="qrType" label="美化方式">
				<el-select v-model="form.qrLogoType">
					<el-option v-for="item in form.allQrTypes" :key="item.type" :label="item.name" :value="item.type">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="qrMark" label="备注">
				<el-input placeholder="二维码备注号" v-model="form.qrMark" />
			</el-form-item>
			<el-form-item prop="desc" label="描述">
				<el-input placeholder="描述" v-model="form.desc" />
			</el-form-item>
			<el-form-item style="float:right">
				<el-button size="default" type="primary" @click="ocr(ruleFormRef)">ocr识别</el-button>
				<el-button size="default" type="primary" @click="onSubmit(ruleFormRef)">提交</el-button>
				<el-button size="default" @click="canle">取消</el-button>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>
  
<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from 'vue';
import { qrApi } from '/@/api/pay/qrIndex'

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

const payType = reactive([]
);

const formEdit = reactive({
	init: false

}
);

// do not use same name with ref
const form = reactive({
	dialogFormVisible: false,
	payAmount: null,
	qrBase64: null,
	qrOldBase64: null,
	qrMark: null,
	qrType: null,
	qrLogoType: null,
	desc: null,
	dialogVisibleImg: true,
	fileList: [],
	allQrTypes: [],
	id: null,

});
const ocrData = reactive({
	qrOldBase64: null,
	result: null

});

const ocr = () => {
	ocrData.qrOldBase64 = form.qrOldBase64
	qrApi().baiduOcr(ocrData).then((res) => {
		if (res.code == 200) {
			ocrData.result = res.data
			form.payAmount = res.data["words_result"][1]["words"].replace('￥', '')
			form.qrMark = res.data["words_result"][2]["words"]
			ElMessage.success("识别成功")
		} else {
			ElMessage.error(res.msg)

		}

	}).catch(() => {
		ElMessage.error("识别失败")
	})
}

watch(props, () => {
	if (!formEdit.init) {
		formEdit.init = true
		form.payAmount = props.selData?.payAmount ? props.selData.payAmount : null
		form.qrBase64 = props.selData?.qrBase64 ? props.selData.qrBase64 : null
		form.qrOldBase64 = props.selData?.qrOldBase64 ? props.selData.qrOldBase64 : null
		form.qrMark = props.selData?.qrMark ? props.selData.qrMark : null
		form.qrLogoType = props.selData?.qrLogoType ? props.selData.qrLogoType : 0
		form.qrType = props.selData?.qrType ? props.selData.qrType : 1
		form.desc = props.selData?.desc ? props.selData.desc : null
		form.id = props.selData?.id ? props.selData.id : null
		if (props.selData?.qrOldBase64) {
			form.fileList = [{ url: props.selData.qrOldBase64 }]
		}
	}
	form.dialogFormVisible = props.dialogFormVisible
})

const rules = reactive<FormRules>({
	payAmount: [
		{ required: true, message: '请输入金额', trigger: 'blur' },
		{ pattern: /(^[1-9]([0-9]?){1,10}$)|(^[0-9]{1,10}\.[0-9]{1,2}$)/, message: '只支持整数，或者两位小数', trigger: 'blur' },
	],
	qrOldBase64: [
		{ required: true, message: '请上传二维码', trigger: 'blur' },
	],
	qrMark: [
		{ required: true, message: '请输入二维码', trigger: 'blur' },
	],
	qrLogoType: [
		{ required: true, message: '请选择美化方式', trigger: 'blur' },
	],
	qrType: [
		{ required: true, message: '请选择支付类型', trigger: 'blur' },
	]

})


const onSubmit = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid) => {
		if (!valid) {
			return
		}
		if (props.type == 1) {
			form.id = null
			qrApi().addQr(form).then((res) => {
				if (res.code == 200) {
					ElMessage.success('操作成功');
					emits("closeChild", false)
				} else {
					ElMessage.error(res.msg);
				}
			}).catch(() => {
				ElMessage.error('操作失败');
			})
		} else {
			qrApi().updateQr(form).then(() => {
				ElMessage.success('操作成功');
				emits("closeChild", false)
			}).catch(() => {
				ElMessage.error('操作失败');
			})
		}

	})

}
const canle = () => {
	form.fileList = []
	emits("closeChild", false)
};
const myUpload = (file) => {
	getBase64(file.raw).then(res => {
		form.qrOldBase64 = res
	})
};
const getBase64 = (file) => {
	return new Promise(function (resolve, reject) {
		const reader = new FileReader()
		let imgResult = ''
		reader.readAsDataURL(file)
		reader.onload = function () {
			imgResult = reader.result
		}
		reader.onerror = function (error) {
			reject(error)
		}
		reader.onloadend = function () {
			resolve(imgResult)
		}
	})
}


const getAllQrType = () => {
	qrApi().getAllQrType().then((res) => {
		form.allQrTypes = res.data
		for (let i in res.data) {
			if (res.data[i].type != 0) {
				payType.push(res.data[i])
			}
		}

	}).catch(() => {
		ElMessage.error('操作失败');
	})
}
onMounted(() => {
	getAllQrType()
})

</script>

<style>
.upload-demo {
	width: 100%;
}

.el-upload-dragger {
	padding: auto;
	height: 100%;
}
</style>
  