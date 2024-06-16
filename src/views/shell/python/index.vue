<template>
	<div class="system-dic-container layout-padding">
		<div>
			<el-row class="mb-4 topMenu">
				<el-button size="default" @click="run">运行</el-button>
				<el-button type="primary" @click="save" size="default">保存</el-button>
			</el-row>
		</div>
		<div class="box">
			<div @click.left="close" v-on:contextmenu="rightClick" class="treeMeun">
				<section ref="tMenu" class="light">
					<ul class="light-menu-list">
						<li v-if="state.folderVisible" @click="propData.dialogFormVisible = true, propData.type = 2">
							<el-icon class="menuIcon">
								<FolderAdd />
							</el-icon>
							<span>新建文件夹</span>
						</li>
						<li v-if="state.fileVisible" @click="propData.dialogFormVisible = true, propData.type = 1">
							<el-icon class="menuIcon">
								<DocumentAdd />
							</el-icon>
							<span>新建文件</span>
						</li>
						<li @click="dialogVisible">
							<el-icon class="menuIcon">
								<DeleteFilled />
							</el-icon>
							<span>删除文件</span>
						</li>
						<li @click="propData.dialogFormVisible = true, propData.type = 3">
							<el-icon class="menuIcon">
								<Edit />
							</el-icon>
							<span>编辑</span>
						</li>
					</ul>
				</section>
				<PyFrom :propData="propData" @flush-menu="getTree" />
				<el-tree :data="treeData" @node-click="nodeClick" @node-contextmenu="rightClick">
					<template #default="{ data }">
						<span class="custom-tree-node">
							<el-icon class="menuIcon" v-if="data.type == 2">
								<Folder />
							</el-icon>
							<el-icon class="menuIcon" v-if="data.type == 1">
								<Document />
							</el-icon>
							<el-tooltip class="box-item" effect="dark" :content="data.name" placement="top-start">
								<span>{{ data.fileName }}</span>
							</el-tooltip>
						</span>
					</template>
				</el-tree>
			</div>
			<div class="edit">
				<div class="code">
					<codemirror v-model="code" placeholder="Code goes here..." style="height: 100%;" :autofocus="true"
						:indent-with-tab="true" :extensions="extensions" @ready="handleReady" />
				</div>
				<div class="result">
					<p v-for="item in state.msg">{{ item }}<br /><br /></p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, shallowRef, reactive, unref, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { ViewUpdate, payload } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { ElMessageBox, ElMessage, Action } from 'element-plus';
import { pythonApi } from '/@/api/python/index'
import { sseService } from '/@/utils/sse'
import { Session } from '/@/utils/storage';

const PyFrom = defineAsyncComponent(() => import('/@/views/shell/python/component/pyFrom.vue'));

interface Tree {
	id: number
	label: string
	desc: string
	children?: Tree[]
}

const treeData = ref<Tree[]>([
]);

const code = ref();
const tMenu = ref();
const extensions = [python()];
const state = reactive({
	fileVisible: true,
	folderVisible: true,
	nodeData: null,
	msg: []
});


const propData = ref({
	dialogFormVisible: false,
	type: 1,
	nodeData: null
})

// Codemirror EditorView instance ref
const view = shallowRef();
const handleReady = (payload: payload) => {
	view.value = payload.view;
};

const dialogVisible = () => {
	ElMessageBox.alert('确认删除文件', '提示', {
		// if you want to disable its autofocus
		// autofocus: false,
		confirmButtonText: '确认',
		callback: (action: Action) => {
			if (action == 'confirm') {
				pythonApi().remove(propData.value.nodeData.data.code).then((res) => {
					ElMessage.success('操作成功');
					getTree();

				})

			}

		},
	});
};



const rightClick = (event?, data?, obj?, node?) => {
	event.preventDefault()
	if (data && data.type == 1) {
		state.fileVisible = false
		state.folderVisible = false
	}
	if (data && data.type == 2) {
		state.folderVisible = false
		state.fileVisible = true
	}
	propData.value.nodeData = obj;
	tMenu.value.style.display = 'block';
	tMenu.value.style.top = event.y + 'px';
	tMenu.value.style.left = event.x + 'px';
};

const nodeClick = (event?, data?, obj?, node?) => {
	pythonApi().getInfo(data.data.id).then((res) => {
		state.nodeData = res.data
		code.value = res.data.pythonCode
		const msg = '开始运行...'
		state.msg = []
		state.msg.push(msg)
	})

}
const userId = Session.get('userId');
const close = () => {
	tMenu.value.style.display = 'none';
};

const save = () => {
	if (state.nodeData == null) {
		ElMessage.warning("请先选择文件！")
		return;
	}
	state.nodeData['pythonCode'] = code
	pythonApi().update(state.nodeData).then(() => {
		ElMessage.success("操作成功！")
	})
};

const run = () => {
	if (state.nodeData == null) {
		ElMessage.warning("请先选择文件！")
		return;
	}
	state.nodeData['pythonCode'] = code
	pythonApi().run(state.nodeData).then(() => {
		ElMessage.success("操作成功！")
	})
	const msg = '开始运行...'
	state.msg = []
	state.msg.push(msg)
};

onMounted(() => {
	getTree()
});
// 当组件从 DOM 中卸载前执行的操作
onUnmounted(() => {
	sseService.disconnect()
})

const result: Element = ref(null)
// 建立连接
let sseChatParams: SSEChatParams = {
	url: import.meta.env.VITE_PUBLIC_PATH + "/sse/createConnect",
	onmessage: (event: MessageEvent) => {
		// 收到消息
		const msg = JSON.parse(event.data)['data'];
		state.msg.push(msg)

	},
	finallyHandler: () => {
	}
};
sseService.connect(sseChatParams)


const getTree = () => {
	pythonApi().list().then((res) => {
		if (res) {
			treeData.value = []
			if (res.data) {
				res.data.forEach(element => {
					treeData.value.push(element)
				});
			}

		}

	})
}
</script>
<style>
.layout-parent {
	background-color: white;
}

.menuIcon {
	color: #409EFF;
	margin-top: 5px;
	margin-right: 5px;

}

.menuIcon span {
	text-align: center;
	vertical-align: middle;
	padding-bottom: 10px;

}

.topMenu {
	float: right;
}

.light {
	background-color: white;
	position: fixed;
	z-index: 999;
	width: 100px;
	height: auto;
	display: none;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.light ul {
	list-style: none;
	color: #606266;
}

.light li {
	margin: 5px;
	font-size: small;
}

.light span {
	cursor: pointer;
	margin-left: 5px;
}

.light hr {
	margin-top: 5px;
}

.box {
	position: relative;
	display: flex;
	width: 100%;
	overflow-y: hidden;
	height: auto;
	flex-direction: row;
}

.treeMeun {
	min-width: 150px;
	width: auto;
	margin-right: 10px;
	opacity: 100%;
}

.edit {
	display: flex;
	flex-direction: row;
	overflow-y: scroll;
	width: 100%;
	border: 1px solid gray;
}

.code {
	width: 50%;
	border-right: 1px solid yellow;
	height: 1000px;
	justify-content: flex-start;

}

.result {
	width: auto;
}
</style>
