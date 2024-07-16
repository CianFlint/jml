# How to use
Include this script in the html head
```html
<script src="https://cdn.jsdelivr.net/gh/CianFlint/jml@6c92397/jml.js"></script>
```

### Attributes
| HTML Attribute | Description |
| --- | --- |
| get | retrieve and generate html using json from a url |
| json | generate html using json |
| include | which json fields to include, empty to include all |
| exclude | which json fields to exclude, empty to exclude none |
| each | generate additional html for each occurence of a field |
| limit | limits the number of rows to generate html from |
| modifier | execute a custom or built-in method to modify the json |
| visibility | overwrites initial visibility style for the element |
| loading | makes an element only visible during the loading phase |
| after | render nested element after the generated html |
| tsrc | use instead of `src` in `each` loops to prevent console errors |

### Selectors
The `include` and `exclude` attributes support multi-path and single path selectors whereas the `each` and `modifier` attributes only support single path selectors. If the `include` attribute's selector is incomplete and points to a JSON object, the child fields remain part of the scope but will not be rendered, however they can still accessed through the `each` attribute
| Selector | Type | Description |
| --- | --- | --- |
| `<key>` | single | any json object field name e.g. `users` |
| `.` | single | chain keys together to target child fields e.g. `users.name.firstname` |
| `\|` | multi | target multiple child fields e.g. `name.firstname\|lastname` |
| `,` | multi | separate multiple selectors e.g. `users.id,users.name.firstname` |
| `*` | multi | select all child fields e.g. `users.name.*` |

### Built-in Modifiers
| Method | Paramaters | Optional | Description |
| --- | --- | --- | --- |
| numberedList() | selector, key | off=0, <br>sep=". " | assign numbering to a field in an array of objects with an optional offset and separator |
| sortArray() | selector, key | desc=false | sort an array of objects by a key with field values of string, number, or array length by either ascending or descending |
| omitParent() | selector, key |  | delete a parent node while maintaining the children e.g. `omitParent(users,name)` modifies `users.name.firstname` to `users.firstname` |
| renameNode() | selector, key, rename |  | rename a node e.g. `renameNode(user.name,lastname,surname)` modifies `user.name.lastname` to `user.name.surname` |
| toIndex() | selector, key | index=0 | move to a specified `index` under the parent node, negative indexes are also supported |
...

*You can contribute to this project by extending the list of built-in modifiers*

### Helper Functions
| Function | Paramaters | Description |
| --- | --- | --- |
| nodeIndex() | data, key | returns the index of the specified `key` |

# Examples

### 1 - Get JSON and Include Fields
Get json from `https://pokeapi.co/api/v2/pokemon` and only include `results.name` and `results.url`
```html
<div
	get="https://pokeapi.co/api/v2/pokemon"
	include="results.name|url"
></div>
```
**OR**
```html
<div
	get="https://pokeapi.co/api/v2/pokemon"
	include="results.name,results.url"
></div>
```
**OR**
```html
<div
	get="https://pokeapi.co/api/v2/pokemon"
	include="results.*"
></div>
```

<details>
  <summary>HTML Output</summary>

```html
<div>
    <div class="results">
        <div class="row">
            <div class="name">bulbasaur</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/1/</div>
        </div>
        <div class="row">
            <div class="name">ivysaur</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/2/</div>
        </div>
        <div class="row">
            <div class="name">venusaur</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/3/</div>
        </div>
        <div class="row">
            <div class="name">charmander</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/4/</div>
        </div>

...

        <div class="row">
            <div class="name">raticate</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/20/</div>
        </div>
    </div>
</div>
```
  
</details>

<hr>

### 2 - Each and Custom HTML
Loop through each of the results and target the `name` field, optionally, `{this}` will be replaced by the corresponding name. This allows for additional customization of the outputted html structure
```html
<div
	get="https://pokeapi.co/api/v2/pokemon"
	include="results"
>
	<h1 each="results.name">{this}</h1>
</div>
```

<details>
  <summary>HTML Output</summary>

```html
<div>
    <div class="results">
        <div class="row">
            <h1>bulbasaur</h1>
        </div>
        <div class="row">
            <h1>ivysaur</h1>
        </div>
        <div class="row">
            <h1>venusaur</h1>
        </div>
        <div class="row">
            <h1>charmander</h1>
        </div>

...

        <div class="row">
            <h1>raticate</h1>
        </div>
    </div>
</div>
```
  
</details>

<hr>

### 3 - Generative Nesting through the Uniform Interface
If part of your returned JSON data contains a url you can target it using `{this}` paired with the `get=` attribute to generate additional HTML from the API
```html
<div
	get="https://pokeapi.co/api/v2/pokemon"
	include="results"
>
	<h1 each="results.name">{this}</h1>
	<div
		each="results.url"
		get="{this}"
		include="moves.move.name"
	>
		<br>
		<h2>Moveset:</h2>
	</div>
</div>
```

<details>
  <summary>HTML Output</summary>

```html
<div>
    <div class="results">
        <div class="row">
            <h1>bulbasaur</h1>
            <div>
                <br>
                <h2>Moveset:</h2>
                <div class="moves">
                    <div class="row">
                        <div class="move">
                            <div class="name">razor-wind</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="move">
                            <div class="name">swords-dance</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="move">
                            <div class="name">cut</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="move">
                            <div class="name">bind</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="move">
                            <div class="name">vine-whip</div>
                        </div>
                    </div>

...

```
  
</details>

<hr>

### 4 - Modifiers and Limit
Use the `modifier=` attribute to call custom or built-in modifier methods such as `sortArray()`. The first argument is a selector, in this case it points to an array called `results`, the second argument is the key to sort the objects in the array on, and the last argument optionally reverses the array
```html
<div
	get="https://pokeapi.co/api/v2/pokemon"
	include="results,count"
	modifier="sortArray(results,name,true)"
	limit=5
>
	<h3 each="results.name">{this}</h3>
</div>
```

<details>
  <summary>HTML Output</summary>

```html
<div>
    <div class="count">1302</div>
    <div class="results">
        <div class="row">
            <h3>weedle</h3>
        </div>
        <div class="row">
            <h3>wartortle</h3>
        </div>
        <div class="row">
            <h3>venusaur</h3>
        </div>
        <div class="row">
            <h3>squirtle</h3>
        </div>
        <div class="row">
            <h3>rattata</h3>
        </div>
    </div>
</div>
```
  
</details>

<hr>

### 5 - Custom and Multiple Modifiers
There is support to write your own custom modifiers, the first paramater will receive JSON data when a selector is passed to it. Custom modifiers can also be used to call multiple modifiers at once
```js
function customExample(data, key) {
	
	sortArray(data, key, true);
	numberedList(data, key);
	return data;
	
}
```
All built-in or custom modifier methods require a selector as the first argument, the selector will then pass the corresponding JSON data to the first paramater of the modifier method
```html
<div
	get="https://pokeapi.co/api/v2/pokemon"
	modifier="customExample(results,name)"
	limit=5
></div>
```

<details>
  <summary>HTML Output</summary>

```html
<div>
    <div class="count">1302</div>
    <div class="next">https://pokeapi.co/api/v2/pokemon?offset=20&amp;limit=20</div>
    <div class="previous"></div>
    <div class="results">
        <div class="row">
            <div class="name">1. weedle</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/13/</div>
        </div>
        <div class="row">
            <div class="name">2. wartortle</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/8/</div>
        </div>
        <div class="row">
            <div class="name">3. venusaur</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/3/</div>
        </div>
        <div class="row">
            <div class="name">4. squirtle</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/7/</div>
        </div>
        <div class="row">
            <div class="name">5. rattata</div>
            <div class="url">https://pokeapi.co/api/v2/pokemon/19/</div>
        </div>
    </div>
</div>
```
  
</details>
