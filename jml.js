document.addEventListener("DOMContentLoaded", async () => {
	
	for (let get of document.querySelectorAll("[get]")) {
		
		let data = await fetchAsync(get.getAttribute("get"));
		let params = {};
		params.include = query(get.getAttribute("include"), false);
		params.exclude = query(get.getAttribute("exclude"), true);
		jml(get, data, "", params, get);
		for (let each of get.querySelectorAll("[each]")) each.remove();
		
	}
  
});

async function fetchAsync(url) {
	
	let response = await fetch(url);
	let data = await response.json();
	
	return data;
	
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

function each(node, path, par) {
	
	for (let each of par.querySelectorAll("[each]")) {
		
		if (each.getAttribute("each") != path) continue;
		new_node = each.cloneNode(true);
		new_node.removeAttribute("each");
		node.after(new_node);
		
	}
	
}

function jml(node, json, path, params, par) {
	
	if (params?.include) if (!params.include.includes(path)) node.remove();
	if (params?.exclude) if (params.exclude.includes(path)) node.remove();
	
	if (typeof json === "string" || typeof json === "number") {
		node.innerHTML = json;
		if (node.className == "row") {
			let span = document.createElement("span");
			span.innerHTML = node.innerHTML;
			span.classList.add("row");
			node.after(span);
			node.remove();
		}
	}
	else if (json.length) {
		for (let row of json) {
			
			node.insertAdjacentHTML("beforeend", "<div class='row'></div>");
			let nodes = node.querySelectorAll(".row");
			let next_node = nodes[nodes.length-1];
			jml(next_node, row, path, params, par);
			
		}
	} else {
		for (let key of sort(Object.keys(json), params?.include, path)) {
			
			node.insertAdjacentHTML("beforeend", "<div class='"+key+"'></div>");
			let nodes = node.querySelectorAll("."+key);
			let next_node = nodes[nodes.length-1];
			each(next_node, path+"."+key, par);
			jml(next_node, json[key], (path ? path+"."+key : key), params, par);
			
		}
	}
	
}