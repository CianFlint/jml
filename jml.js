var trigger;
(function() {
	
	document.addEventListener("DOMContentLoaded", async () => {
		
		getJSON();
	  
	});

	trigger = getJSON;
	let trigger_delay = [];
	async function getJSON(label = null) {
		
		if (label && document.querySelectorAll("[each][trigger='{index}']").length && !document.querySelectorAll("[trigger='"+label+"']").length) {
			if (!(label in trigger_delay)) trigger_delay.push(label);
			return;
		}
		if (label) for (let ele of document.querySelectorAll("[trigger='"+label+"']")) ele.removeAttribute("trigger");
		for (let ele of document.querySelectorAll("[get],[json]")) ele.style.visibility = "hidden";
		for (let ele of document.querySelectorAll("[get]")) {
			
			if (ele.getAttribute("visibility") != "hidden") ele.setAttribute("visibility", "");
			try { for (let e of ele.querySelectorAll("[trigger='"+ele.getAttribute("trigger")+"'] > *")) if (!e.hasAttribute("trigger")) e.setAttribute("trigger", ele.getAttribute("trigger")); } catch {}
			if (ele.hasAttribute("trigger")) continue;
			for (let e of ele.querySelectorAll("[loading]")) { e.style.visibility = "visible"; }
			let data = await fetchAsync(ele.getAttribute("get"));
			if (!data) continue;
			ele.removeAttribute("get");
			load(ele, data);
			
		}
		
		for (let ele of document.querySelectorAll("[json]")) {
			
			if (ele.getAttribute("visibility") != "hidden") ele.setAttribute("visibility", "");
			try { for (let e of ele.querySelectorAll("[trigger='"+ele.getAttribute("trigger")+"'] > *").reverse()) if (!e.hasAttribute("trigger")) e.setAttribute("trigger", ele.getAttribute("trigger")); } catch {}
			if (ele.hasAttribute("trigger")) continue;
			for (let e of ele.querySelectorAll("[loading]")) { e.style.visibility = "visible"; }
			try {
				let data = JSON.parse(ele.getAttribute("json"));
				if (!data) continue;
				ele.removeAttribute("json");
				load(ele, data);
			} catch {}
			
		}
		
		await fetchAsync("");
		let save_this = [];
		for (let ele of document.querySelectorAll("[trigger] > *")) save_this.push(ele.parentElement.innerHTML);
		document.body.innerHTML = document.body.innerHTML.replace(/get="{this:(.+?)}"/gm, "get='$1'");
		if (document.querySelectorAll("[get]").length - document.querySelectorAll("[get][trigger]").length) await getJSON();
		document.body.innerHTML = document.body.innerHTML.replace(/{this:(.+?)}/gm, "$1");
		let index = 0;
		for (let ele of document.querySelectorAll("[trigger] > *")) {
			if (ele.parentElement) ele.parentElement.innerHTML = save_this[index];
			index++;
		}
		
		for (let last of document.querySelectorAll(".row_last")) last.remove();
		for (let img of document.querySelectorAll(":not([trigger]) > [tsrc]")) { img.setAttribute("src", img.getAttribute("tsrc")); img.removeAttribute("tsrc") }
		for (let ele of document.querySelectorAll("[visibility]:not([trigger])")) {
			if (ele.getAttribute("visibility") != "hidden") ele.style.visibility = "";
			ele.removeAttribute("visibility");
		}
		for (let ele of document.querySelectorAll(":not([trigger]) > [loading]")) { ele.remove(); }
		for (let ele of document.querySelectorAll(":not([trigger]) > [after]")) { ele.parentElement.appendChild(ele); }
		for (let ele of document.querySelectorAll("[style='']:not([trigger])")) ele.removeAttribute("style");
		
		for (let t of trigger_delay) { await getJSON(trigger_delay.pop(trigger_delay.indexOf(t))); }
		for (let ele of document.querySelectorAll(":not([trigger]) > [loaded]")) {
			let func = ele.getAttribute("loaded").split(/[()]/);
			let args = func[1].replaceAll(" ", "").split(",");
			if (!args[0]) args = [];
			window[func[0]](...args);
			ele.removeAttribute("loaded");
		}
		
	}

	async function load(ele, data) {
		
		let params = {};
		params.include = query(ele.getAttribute("include"), false);
		params.exclude = query(ele.getAttribute("exclude"), true);
		params.limit = ele.getAttribute("limit");
		params.modifier = {"func" : null, "selector" : null, "args" : []};
		ele.removeAttribute("include");
		ele.removeAttribute("exclude");
		ele.removeAttribute("limit");
		modifier(ele, data, params);
		jml(ele, data, "", params, ele);
		for (let each of ele.querySelectorAll(":not([trigger]) > [each]")) each.remove();
		
	}

	async function fetchAsync(url) {
		
		if (url == "{this}" || url == "" || url == null) return;
		let response = await fetch(url);
		let data = await response.json();
		return data;
		
	}

	async function modifier(ele, data, params) {
		
		let mod = ele.getAttribute("modifier");
		if (!mod) return;
		let func = mod.split(/[()]/);
		let args = func[1].replaceAll(" ", "").split(",");
		params.modifier.func = func[0];
		params.modifier.selector = args[0] || "";
		params.modifier.args = args.slice(1);
		ele.removeAttribute("modifier");

	}

	function split(str, match) {

		index = str.indexOf(match);
		if (index == -1) return str;
		const result = [str.slice(0, index), str.slice(index+match.length)];
		return result;
		
	}

	function parse(q, p, output) {
		
		if (!output[0].includes(p.slice(1))) output[0].push(p.slice(1));
		if (q == 0) { output[1].push(p.slice(1)); return; }
		if (typeof q === "string") { parse(0, p+"."+q, output); return; }
		for (let x of q) {
			
			if (x.indexOf(".") != -1) {
				s = split(x, ".");
				parse(s[1].split("|"), p+"."+s[0], output);
			} else { parse(x, p, output); }
			
		}
		
	}

	function query(q, ex) {
		
		ex = ex || false;
		if (!q) return;
		let output = [[],[]];
		parse(q?.replaceAll(/\s/g,'')?.split(","), "", output);
		return output[ex ? 1 : 0];
		
	}

	function sort(k, r, p) {
		
		if (!r) return k;
		let output = [];
		for (let x of r) if (k.includes(split(x, p)[1]?.slice(1))) output.push(split(x, p)[1].slice(1));
		for (let x of k) if (!output.includes(x)) output.push(x);
		return output;
		
	}

	async function each(node, json, path, params, par, index) {
		
		let used = false;
		for (let each of par.querySelectorAll("[each]")) {
			
			if (each.getAttribute("each") != path) continue;
			used = true;
			let new_node = each.cloneNode(true);
			new_node.removeAttribute("each");
			node.after(new_node);
			if (params.modifier) if (params.modifier.selector == path) json = window[params.modifier.func](json, ...params.modifier.args);
			
			let type = typeof json;
			if (type === "string" || type === "number") new_node.outerHTML = await new_node.outerHTML.replaceAll(/{this.*?}/g, "{this:"+json+"}").replaceAll("{index}", index);
			else new_node.outerHTML = await new_node.outerHTML.replaceAll(/"{this.*?}"/g, "'"+JSON.stringify(json)+"'").replaceAll("{index}", index);
			
		}
		if (params.modifier && used) if (params.modifier.selector == path) delete params.modifier;
		
	}

	async function jml(node, json, path, params, par, index = 0) {
		
		path = path.replaceAll(/__\d+\./g, ".").replaceAll(/__\d+/g, "");
		if (params?.include) if (!params.include.includes(path) && !(params.include.slice(-1)[0].includes(".*") && path.includes(params.include.slice(-1)[0].split("*")[0]))) { node.remove(); return; }
		if (params?.exclude) if (params.exclude.includes(path)) { node.remove(); return; }
		if (params.modifier) if (params.modifier.selector == path) { json = window[params.modifier.func](json, ...params.modifier.args); }
		let limit = params.limit ? parseInt(params.limit, 10) : -1;
		
		if (typeof json === "string" || typeof json === "number") {
			node.innerHTML = json;
			if (node.className == "row") {
				let span = document.createElement("span");
				span.innerHTML = node.innerHTML;
				span.classList.add("row");
				node.after(span);
				node.remove();
			}
		} else if (json) {
			if (json.length) {
				let i = 0;
				if (params.modifier) if (params.modifier.selector == path) delete params.modifier;
				for (let row of json) {
					
					if (limit == 0) return;
					node.insertAdjacentHTML("beforeend", "<div class='row'></div>");
					let nodes = node.querySelectorAll(".row");
					let next_node = nodes[nodes.length-1];
					jml(next_node, row, path, params, par, index+i);
					if (limit == 1) {
						node.insertAdjacentHTML("beforeend", "<div class='row_last'></div>");
						nodes = node.querySelectorAll(".row_last");
						next_node = nodes[nodes.length-1];
						jml(next_node, row, path, params, par, index+i);
					}
					limit--;
					i++;
					
				}
			} else {
				for (let key of sort(Object.keys(json), params?.include, path)) {
					
					let k = key.split("__")[0]+" ";
					if (k == key+" ") k = "";
					node.insertAdjacentHTML("beforeend", "<div class='"+k+key+"'></div>");
					let nodes = node.querySelectorAll("."+key);
					let next_node = nodes[nodes.length-1];
					each(next_node, json[key], path+"."+key, params, par, index);
					jml(next_node, json[key], (path ? path+"."+key : key), params, par);
					
				}
			}
		}
		
	}
	
})();



/* Built-in Modifier Methods */

function numberedList(data, key, off = 0, sep = ". ") {
	
	if (key === undefined) return data;
	let i = off;
	for (let x of data) {
		
		i++;
		x[key] = i + sep + x[key];
		
	}
	return data;
	
}

function sortArray(data, key, desc = false) {
	
	if (key === undefined) return data;
	let type = typeof data[0][key];
	if (type == "string") {
		data.sort((a, b) => {
			a = a[key].toUpperCase();
			b = b[key].toUpperCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		});
	}
	if (type == "number") data.sort((a, b) => a[key] - b[key]);
	if (type == "object") data.sort((a, b) => a[key].length - b[key].length);
	if (desc) data = data.reverse();
	return data;
	
}

function omitParent(data, key) {
	
	if (key === undefined) return data;
	if (data.length === undefined) {
		if (!data[key].length) for (let k of Object.keys(data[key])) { data[k] = data[key][k]; }
		else {
			let i = 0;
			let d = [...data[key]];
			delete data[key];
			for (let x of d) {
				
				for (let k of Object.keys(x)) data[k+"__"+i] = x[k];
				i++;
			
			}
		}
		return data;
	}
	let i = 0;
	for (let x of data) {
		
		let x = {...data[i]};
		delete data[i][key];
		for (let k of Object.keys(x[key])) data[i][k] = x[key][k];
		i++;
		
	}
	return data;
	
}

function renameNode(data, key, rename) {
	
	if (key === undefined || rename === undefined) return data;
	let d = data[key];
	delete data[key];
	data[rename] = d;
	return data;
	
}

function toIndex(data, key, index = 0) {
	
	let i = -1;
	let d = {...data};
	let found = false;
	if (index < 0) index = Object.keys(data).length+index+1;
	for (let k of Object.keys(data)) {
		
		i++;
		if (i == index) {
			delete data[key];
			data[key] = d[key];
			found = true;
		}
		if (k == key) continue;
		delete data[k];
		data[k] = d[k];
		
	}
	if (!found) delete data[key]; data[key] = d[key];
	return data;
	
}


/* Helper Functions */

function nodeIndex(data, key) { return Object.keys(data).indexOf(key); }
