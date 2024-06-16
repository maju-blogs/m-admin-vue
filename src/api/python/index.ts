import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 */
export function pythonApi() {
	return {
		save: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pythonFile/save',
				method: 'post',
				data
			});
		},
		remove: (code: string) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pythonFile/remove/' + code,
				method: 'post'
			});
		},
		update: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pythonFile/update',
				method: 'post',
				data,
			});
		},
		run: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pythonFile/run',
				method: 'post',
				data,
			});
		},
		list: () => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pythonFile/list',
				method: 'get'
			});
		},
		getInfo: (id: number) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/pythonFile/getInfo/' + id,
				method: 'get',
			});
		},
	};
}
