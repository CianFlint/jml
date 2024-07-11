# How to use
Include this script in the html head
```html
<script src="https://cdn.jsdelivr.net/gh/CianFlint/jml@cc407bd/jml.js"></script>
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
| modifier | execute a custom or built-in function to modify the json |
| visiblity | overwrites initial visiblity style for the element |

### Modifiers
| Built-in Modifier | Paramters | Description |
| --- | --- | --- |
| numberedList() | selector, key, [off = 0, sep = ". "] | assign numbering to a field in an array of objects |
| sortArray() | selector, key, [desc = false] | sort array of objects by key with value of string, number, or array length |

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
Loop through each of the results and target the `name` field, optionally, `{this}` will be replaced by the corresponding name.
This allows for additional customization of the outputted html structure.
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
