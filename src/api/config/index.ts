import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 */
export function configApi() {
	return {
		save: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/config/save',
				method: 'post',
				data,
			});
		},
		update: (data: object) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/config/update',
				method: 'post',
				data,
			});
		},
		getInfo: (id: number) => {
			return request({
				url: import.meta.env.VITE_PUBLIC_PATH + '/config/getInfo/' + id,
				method: 'get',
			});
		},
	};
}
