import { n as __exportAll } from "./rolldown-runtime-DC62tzP2.js";
//#region node_modules/@ogrtk/simple-felica-reader/dist/lib/utils.js
var utils_exports = /* @__PURE__ */ __exportAll({
	arrayToHex: () => l,
	binArrayToHex: () => a,
	dataViewToUint8Array: () => c,
	hexStringToByteArray: () => u$1,
	hexToAscii: () => s,
	sleep: () => f
});
function s(t) {
	const r = t.replace(/\s+/g, "");
	if (r.length % 2 !== 0) throw new Error("Invalid hex string: length must be even.");
	let e = "";
	for (let i = 0; i < r.length; i += 2) {
		const n = r.slice(i, i + 2), o = Number.parseInt(n, 16);
		if (Number.isNaN(o)) throw new Error(`Invalid hex pair: ${n}`);
		e += String.fromCharCode(o);
	}
	return e;
}
function l(t, r = !1) {
	let e = "";
	for (const i of t) {
		let n = i.toString(16);
		n = i < 16 ? `0${n}` : n, e += `${n.toUpperCase()} `;
	}
	return r ? e.replaceAll(" ", "") : e;
}
function a(t) {
	if (!t) return "";
	let r = "";
	for (let e = 0; e < t.byteLength; e++) {
		const i = t.getUint8(e);
		let n = i.toString(16);
		n = i < 16 ? `0${n}` : n, r += `${n.toUpperCase()} `;
	}
	return r;
}
function c(t) {
	const r = new Uint8Array(t.byteLength);
	for (let e = 0; e < t.byteLength; e++) r[e] = t.getUint8(e);
	return r;
}
function u$1(t) {
	if (!/^([0-9a-fA-F]{2})+$/.test(t)) throw new Error("Invalid input. The string must be hexadecimal characters.");
	const r = [];
	for (let e = 0; e < t.length; e += 2) r.push(Number.parseInt(t.slice(e, e + 2), 16));
	return r;
}
async function f(t) {
	return new Promise((r) => setTimeout(r, t));
}
//#endregion
//#region node_modules/@ogrtk/simple-felica-reader/dist/lib/FelicaReaderRcS300.js
var m = Object.defineProperty;
var w = (o, t, e) => t in o ? m(o, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: e
}) : o[t] = e;
var u = (o, t, e) => w(o, typeof t != "symbol" ? t + "" : t, e);
var U = class {
	constructor(t, e = !1) {
		u(this, "seq", 0);
		u(this, "commands", {
			startTransparent: [
				255,
				80,
				0,
				0,
				2,
				129,
				0,
				0
			],
			turnOn: [
				255,
				80,
				0,
				0,
				2,
				132,
				0,
				0
			],
			endTransparent: [
				255,
				80,
				0,
				0,
				2,
				130,
				0,
				0
			],
			turnOff: [
				255,
				80,
				0,
				0,
				2,
				131,
				0,
				0
			],
			communicateThruEX: [
				255,
				80,
				0,
				1,
				0
			],
			communicateThruEXFooter: [
				0,
				0,
				0
			]
		});
		u(this, "confSet");
		this.device = t, this.debugEnabled = e;
		const n = (i, h) => i.alternate.endpoints.find((f) => f.direction === h);
		if (!this.device.configuration) throw new Error("configurationがありません");
		const s = this.device.configuration, r = s.interfaces[s.configurationValue], a = n(r, "in");
		if (!a) throw new Error("入力USBエンドポイントが取得できませんでした");
		const d = n(r, "out");
		if (!d) throw new Error("出力USBエンドポイントが取得できませんでした");
		this.confSet = {
			confValue: s.configurationValue,
			interfaceNum: r.interfaceNumber,
			endPointInNum: a.endpointNumber,
			endPointInPacketSize: a.packetSize,
			endPointOutNum: d.endpointNumber,
			endPointOutPacketSize: d.packetSize
		};
	}
	async open() {
		const { confValue: t, interfaceNum: e } = this.confSet;
		await this.device.open(), await this.device.selectConfiguration(t), await this.device.claimInterface(e), await this.sendUsb(this.commands.endTransparent, "End Transeparent Session"), await this.recvUsb(64), await this.sendUsb(this.commands.startTransparent, "Start Transeparent Session"), await this.recvUsb(64), await this.sendUsb(this.commands.turnOff, "Turn Off RF"), await f(50), await this.recvUsb(64), await f(50), await this.sendUsb(this.commands.turnOn, "Turn On RF"), await f(50), await this.recvUsb(64), await f(50);
	}
	/**
	* デバイスのクローズ
	* @returns
	*/
	async close() {
		const { interfaceNum: t } = this.confSet;
		await this.sendUsb(this.commands.turnOff, "Turn Off RF"), await f(50), await this.recvUsb(64), await f(50), await this.sendUsb(this.commands.endTransparent, "End Transeparent Session"), await this.recvUsb(64), await this.device.releaseInterface(t), await this.device.close();
	}
	/**
	* FeliCaの操作
	* communicateThruEXコマンドでWrapして送信
	* @param felicaRequest 処理リクエスト内容
	* @param description 処理説明（デバッグ用）
	* @returns
	*/
	async operateFelica(t, e) {
		const n = await this.wrapCTXIns(t);
		await this.sendUsb(n, e);
		const s = await this.recvUsb(64);
		return this.unwrapCTXResponse(s);
	}
	/**
	* PasoRiへの送信
	* @param data
	* @returns
	*/
	async sendUsb(t, e = "") {
		const s = ((r) => {
			const a = r.length, d = 0, i = new Uint8Array(10 + a);
			return i[0] = 107, i[1] = 255 & a, i[2] = a >> 8 & 255, i[3] = a >> 16 & 255, i[4] = a >> 24 & 255, i[5] = d, i[6] = ++this.seq, a !== 0 && i.set(r, 10), i;
		})(new Uint8Array(t));
		await this.device.transferOut(this.confSet.endPointOutNum, s), this.debugEnabled && console.log(`${e} Send: ${l(s)}`);
	}
	/**
	* PasoRiの応答取得
	* @param rcvLen
	* @returns
	*/
	async recvUsb(t) {
		const { endPointInNum: e } = this.confSet, n = await this.device.transferIn(e, t);
		return this.debugEnabled && console.log(`Recv: ${a(n.data)}`), n;
	}
	/**
	* Felica コマンドを RC-S300 の communicateThruEX 命令形式にラップする。
	*/
	async wrapCTXIns(t) {
		const e = t.length, n = [...this.commands.communicateThruEX];
		return n.push(e >> 8 & 255, e & 255), n.push(...t), n.push(...this.commands.communicateThruEXFooter), n;
	}
	/**
	* communicateThruEX レスポンスから Felica 応答データを取り出す。
	*/
	unwrapCTXResponse(t) {
		if (!t.data) return;
		const e = c(t.data), n = e.indexOf(151);
		if (n < 0) return;
		const s = n + 1, r = e[s], a = Array.from(e.slice(s + 1, s + 1 + r));
		return {
			length: r,
			responseCode: a[1],
			data: a.slice(2)
		};
	}
	/**
	* オープン状態の取得
	*/
	get isOpened() {
		return this.device.opened;
	}
	/**
	* ベンダIDの取得
	*/
	get vendorId() {
		return this.device.vendorId;
	}
	/**
	* プロダクトIDの取得
	*/
	get productId() {
		return this.device.productId;
	}
};
//#endregion
//#region node_modules/@ogrtk/simple-felica-reader/dist/lib/FelicaService.js
var d = {
	"RC-S300/S": {
		vendorId: 1356,
		productId: 3528,
		readerClass: U
	},
	"RC-S300/P": {
		vendorId: 1356,
		productId: 3529,
		readerClass: U
	}
};
var y = class y {
	/**
	* コンストラクタ
	* @param felicaReader
	*/
	constructor(e) {
		this.felicaReader = e;
	}
	/**
	* FeliCaリーダー機器への接続
	* @param readerFilter 接続を許可する機器の型番リスト
	* @param debugEnabled デバッグを有効にする
	* @returns
	*/
	static async connectFelicaReader(e = [], t = !1) {
		let o;
		const r = Object.keys(d), i = e && e.length > 0 ? r.filter((a) => e.includes(a)) : r, s = await navigator.usb.getDevices();
		if (s.length > 0) for (const a of s) {
			const f = i.find((n) => a.vendorId === d[n].vendorId && a.productId === d[n].productId);
			if (f) {
				o = {
					usbDevice: a,
					modelName: f
				};
				break;
			}
		}
		if (!o) {
			let a;
			const f = e.map((n) => ({
				vendorId: d[n].vendorId,
				productId: d[n].productId
			}));
			try {
				a = await navigator.usb.requestDevice({ filters: f });
			} catch (n) {
				if (n instanceof DOMException) return;
				throw n;
			}
			o = {
				usbDevice: a,
				modelName: i.find((n) => a.vendorId === d[n].vendorId && a.productId === d[n].productId)
			};
		}
		const c = new d[o.modelName].readerClass(o.usbDevice, t);
		return new y(c);
	}
	/**
	* デバイスのオープン
	* @returns
	*/
	async openDevice() {
		await this.felicaReader.open();
	}
	/**
	* デバイスのクローズ
	* @returns
	*/
	async closeDevice() {
		await this.felicaReader.close();
	}
	/**
	* Felica のポーリング操作を実行し、IDm とシステムコードを返す。
	*/
	async polling(e = 100) {
		const o = await this.felicaOperation([
			0,
			255,
			255,
			1,
			0
		], e, "Polling");
		if (o) return {
			idm: l(new Uint8Array(o.data.slice(0, 8)), !0),
			systemCode: l(new Uint8Array(o.data.slice(16, 18)), !0)
		};
	}
	/**
	* Felica の RequestService 操作。
	* @param idm Felica のIDm（16進数文字列）
	* @param nodeCodeList ノードコードの配列（各コードは数値）
	*/
	async requestService(e, t) {
		const r = [2];
		if (t.length % 2 !== 0 || t.length < 2 || t.length > 64) throw new Error("ノードコードリストの桁数が不適切です");
		const i = t.length / 2, s = u$1(e), c = r.concat(s).concat([i]).concat(t), u = await this.felicaOperation(c, 100, "RequestService");
		if (u) return {
			idm: l(new Uint8Array(u.data.slice(0, 8)), !0),
			nodeCount: l(new Uint8Array(u.data.slice(8, 9))),
			nodeKeyVerList: l(new Uint8Array(u.data.slice(9)))
		};
	}
	/**
	* Felica の暗号化無しデータ読み取り操作。
	* @param idm Felica のIDm（16進数文字列）
	* @param params 各サービスに対するパラメータの配列
	*/
	async readWithoutEncryption(e, t) {
		if (t.length === 0 || t.length > 16) throw new Error("paramsが不正です。対象のサービスは1〜16個の範囲で指定してください");
		const r = [6], i = u$1(e), s = [t.length], { totalBlockCount: c, blockList: u, serviceCodeList: a } = t.reduce((v, h) => {
			if (h.serviceCode.length !== 4) throw new Error(`サービスコードリストの桁数が不適切です:${h.serviceCode}`);
			return v.serviceCodeList.push(...u$1(h.serviceCode)), v.blockList.push(...this.constructBlockList(h.blockListParam, 0)), v.totalBlockCount += h.blockListParam.blockNoEnd - h.blockListParam.blockNoStart + 1, v;
		}, {
			totalBlockCount: 0,
			blockList: [],
			serviceCodeList: []
		}), f = r.concat(i).concat(s).concat(a).concat([c]).concat(u), n = await this.felicaOperation(f, 100, "ReadWithoutEncryption");
		if (n) return {
			idm: l(new Uint8Array(n.data.slice(0, 8)), !0),
			statusFlag1: l(new Uint8Array(n.data.slice(8, 9))),
			statusFlag2: l(new Uint8Array(n.data.slice(9, 10))),
			blockSize: l(new Uint8Array(n.data.slice(10, 11))),
			blockData: l(new Uint8Array(n.data.slice(11)), !0)
		};
	}
	/**
	* Felica コマンドをラップし、送受信、レスポンスの解析までを行う。
	*/
	async felicaOperation(e, t, o) {
		const r = this.constructFelicaRequest(e, t);
		return await this.felicaReader.operateFelica(r, o);
	}
	constructFelicaRequest(e, t) {
		const o = [
			95,
			70,
			4
		], r = [149, 130], i = t * 1e3, s = e.length + 1, c = [...o];
		return c.push(i & 255, i >> 8 & 255, i >> 16 & 255, i >> 24 & 255), c.push(...r), c.push(s >> 8 & 255, s & 255), c.push(s), c.push(...e), c;
	}
	/**
	* ブロックリストを構成する。
	* @param param ブロック範囲とアクセスモード
	* @param serviceListOrder サービスリスト内の順序
	*/
	constructBlockList(e, t) {
		if (e.blockNoEnd > 65535) throw new Error("blockCountが不正です");
		if (t > 255) throw new Error("serviceListOrderが不正です");
		const o = e.blockNoEnd > 255 ? 3 : 2;
		let r = 0;
		o === 2 && (r += 128), e.accessMode === "purse-cashback" && (r += 16), r += t;
		const i = [];
		for (let s = e.blockNoStart; s <= e.blockNoEnd; s++) {
			const c = new Uint8Array(o);
			c[0] = r, c[1] = s & 255, o === 3 && (c[2] = s >> 8 & 255), i.push(...c);
		}
		return i;
	}
};
//#endregion
//#region node_modules/@ogrtk/simple-felica-reader/dist/lib/WebUsbCardReader.js
var t = class t {
	/**
	* constructor (private)
	* @param usbDevice
	*/
	constructor(c) {
		this.felicaService = c;
	}
	/**
	* デバイスに接続
	* @returns
	*/
	static async connect(c = [], e = !1) {
		const i = await y.connectFelicaReader(c, e);
		return i ? new t(i) : void 0;
	}
	/**
	* IDm読み取り
	* @returns
	*/
	async polling(c = 10) {
		let e = 1, i;
		try {
			for (; !i && e <= c;) e++, await this.felicaService.openDevice(), i = await this.felicaService.polling(), await this.felicaService.closeDevice(), i || await f(1e3);
		} catch (a) {
			throw this.felicaService.felicaReader.isOpened && await this.felicaService.closeDevice(), a;
		}
		return i;
	}
	/**
	* Service確認
	* @returns
	*/
	async requestService(c) {
		try {
			const e = await this.polling();
			if (!e) return;
			await this.felicaService.openDevice();
			const i = await this.felicaService.requestService(e.idm, c);
			return await this.felicaService.closeDevice(), i;
		} catch (e) {
			throw this.felicaService.felicaReader.isOpened && await this.felicaService.closeDevice(), e;
		}
	}
	/**
	* データ読み取り（暗号化無し）
	* @returns
	*/
	async readWithoutEncryption(c) {
		try {
			const e = await this.polling();
			if (!e) return;
			await this.felicaService.openDevice();
			const i = await this.felicaService.readWithoutEncryption(e.idm, c);
			return await this.felicaService.closeDevice(), i;
		} catch (e) {
			throw this.felicaService.felicaReader.isOpened && await this.felicaService.closeDevice(), e;
		}
	}
};
//#endregion
export { U as FelicaReaderRcS300, y as FelicaService, t as WebUsbCardReader, utils_exports as dataUtils, d as felicaReaderModels };
