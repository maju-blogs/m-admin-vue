<template>
	<el-form ref="ruleFormRef" status-icon :model="state.ruleForm" :rules="rules" size="large"
		class="login-content-form">
		<el-form-item prop="userName" class="login-animation1">
			<el-input text placeholder="请输入用户名" v-model="state.ruleForm.userName" clearable autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-User /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item prop="password" class="login-animation2">
			<el-input :type="state.isShowPassword ? 'text' : 'password'" placeholder="请输入密码"
				v-model="state.ruleForm.password" autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Unlock /></el-icon>
				</template>
				<template #suffix>
					<i class="iconfont el-input__icon login-content-password"
						:class="state.isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
						@click="state.isShowPassword = !state.isShowPassword">
					</i>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item prop="code" class="login-animation3">
			<el-col :span="15">
				<el-input text maxlength="4" placeholder="请输入验证码" v-model="state.ruleForm.code" clearable
					autocomplete="off">
					<template #prefix>
						<el-icon class="el-input__icon"><ele-Position /></el-icon>
					</template>
				</el-input>
			</el-col>
			<el-col :span="1"></el-col>
			<el-col :span="8">
				<el-button class="login-content-code" v-model="state.ruleForm.code" @click="change" v-waves>{{
					state.ruleForm.hcode }}</el-button>
			</el-col>
		</el-form-item>
		<el-form-item class="login-animation4">
			<el-button type="primary" class="login-content-submit" @click="onSignIn(ruleFormRef)"
				:loading="state.loading.signIn">
				<span>登 录</span>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts" name="loginAccount">
import { reactive, computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import { useLoginApi } from '/@/api/login';
import { md5 } from "js-md5";
import type { FormInstance, FormRules } from 'element-plus'


// 定义变量内容
const route = useRoute();
const router = useRouter();
const state = reactive({
	isShowPassword: false,
	ruleForm: {
		userName: 'admin',
		password: '',
		code: '',
		hcode: '',
	},
	loading: {
		signIn: false,
	},
	userInfo: {
		tokenValue: '',
		userName: '',
		loginId: '',
	},
});

const form = reactive({
	userName: 'admin',
	password: '',
	code: '',
}
);

// 时间获取
const currentTime = computed(() => {
	return formatAxis(new Date());
});

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules>({

	userName: [
		{ required: true, message: '用户名不能为空', trigger: 'blur' },
	],
	password: [
		{ required: true, message: '密码不能为空', trigger: 'blur' },
	],
	code: [
		{ required: true, message: '验证码不能为空', trigger: 'blur' },
	]
})

// 登录
const onSignIn = async (formEl: FormInstance | undefined) => {
	if (!formEl) return
	await formEl.validate((valid) => {
		if (!valid) {
			return
		}
		state.loading.signIn = true;
		form.password = md5(state.ruleForm.password)
		form.userName = state.ruleForm.userName
		form.code = state.ruleForm.code
		useLoginApi()
			.signIn(form)
			.then((res) => {
				if (res.code == 200) {
					state.userInfo = res.data;
					// 存储 token 到浏览器缓存
					Session.set('token', state.userInfo.tokenValue);
					Session.set('userId', state.userInfo.loginId);
					// 模拟数据，对接接口时，记得删除多余代码及对应依赖的引入。用于 `/src/stores/userInfo.ts` 中不同用户登录判断（模拟数据）
					Cookies.set('userName', state.userInfo.userName);
					// 添加完动态路由，再进行 router 跳转，否则可能报错 No match found for location with path "/"
					initBackEndControlRoutes();
					// // 执行完 initBackEndControlRoutes，再执行 signInSuccess
					signInSuccess(false);
				} else {
					ElMessage.warning(res.msg);
					state.loading.signIn = false;
					change()
				}

			}).catch(() => {
				state.loading.signIn = false;
				ElMessage.warning('登录失败');
				change()
			});
	});
}

// 页面加载时
onMounted(() => {
	change()
});
const change = () => {
	useLoginApi()
		.getCode()
		.then((res) => {
			state.ruleForm.hcode = res.data;
		});
};
// 登录成功后的跳转
const signInSuccess = (isNoPower: boolean | undefined) => {
	if (isNoPower) {
		ElMessage.warning('抱歉，您没有登录权限');
		Session.clear();
	} else {
		// 初始化登录成功时间问候语
		let currentTimeInfo = currentTime.value;
		// 登录成功，跳到转首页
		// 如果是复制粘贴的路径，非首页/登录页，那么登录成功后重定向到对应的路径中
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			router.push('/');
		}
		// 登录成功提示
		const signInText = '欢迎回来！';
		ElMessage.success(`${currentTimeInfo}，${signInText}`);
		// 添加 loading，防止第一次进入界面时出现短暂空白
		NextLoading.start();
	}
	state.loading.signIn = false;
};
</script>

<style scoped lang="scss">
.login-content-form {
	margin-top: 20px;

	@for $i from 1 through 4 {
		.login-animation#{$i} {
			opacity: 0;
			animation-name: error-num;
			animation-duration: 0.5s;
			animation-fill-mode: forwards;
			animation-delay: calc($i/10) + s;
		}
	}

	.login-content-password {
		display: inline-block;
		width: 20px;
		cursor: pointer;

		&:hover {
			color: #909399;
		}
	}

	.login-content-code {
		width: 100%;
		padding: 0;
		font-weight: bold;
		letter-spacing: 5px;
	}

	.login-content-submit {
		width: 100%;
		letter-spacing: 2px;
		font-weight: 300;
		margin-top: 15px;
	}
}
</style>
