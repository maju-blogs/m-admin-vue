import request from '/@/utils/request';

/**
 * 以下为模拟接口地址，gitee 的不通，就换自己的真实接口地址
 *
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 后端控制菜单模拟json，路径在 https://gitee.com/lyt-top/vue-next-admin-images/tree/master/menu
 * 后端控制路由，isRequestRoutes 为 true，则开启后端控制路由
 * @method getAdminMenu 获取后端动态路由菜单(admin)
 * @method getTestMenu 获取后端动态路由菜单(test)
 */
export function payApi() {
	return {
		getAllClient: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pay/clientInfo/list',
				method: 'get',
				params,
			});
		},
		addDevice: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pay/clientInfo/save',
				method: 'post',
				data,
			});
		},
		updateDevice: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pay/clientInfo/update',
				method: 'post',
				data,
			});
		},
		delDevice: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pay/clientInfo/remove/' + params,
				method: 'post',
				params,
			});
		},
		getAllTopic: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pay/clientInfo/getAllTopic',
				method: 'get',
				params,
			});
		},
		getAllPayConfPage: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payConfig/page',
				method: 'get',
				params,
			});
		},
		addPayConf: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payConfig/save',
				method: 'post',
				data,
			});
		},
		updatePayConf: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payConfig/update',
				method: 'post',
				data,
			});
		},
		delPayConf: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payConfig/remove/' + params,
				method: 'post',
				params,
			});
		},
		getClientInfo: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payConfig/getClientInfo',
				method: 'get',
				params,
			});
		},
		getOrderPage: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payOrder/page',
				method: 'get',
				params,
			});
		},
		manualOrder: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payOrder/manualOrder',
				method: 'post',
				params,
			});
		},
		delOrder: (params?: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/payOrder/remove/' + params,
				method: 'post',
				params,
			});
		},
	};
}
