## crossStore  跨域存储


## API 
  * setProxyUrl(url)

	首先要设置要跨域读取数据的那个 url（首先要做的事情）    

  * setItem(key, val)

    存。val可以是 Boolean、Number、String、Object

  * getItem(key, callback)

    取。以获取到的val作为实参调用callback，val存的时候是什么类型的值，获取到的就是什么类型的值

  * removeItem(key)

    删。

  * clear()

    全删。

  * change(callback)

    监听`window.onstorage`事件，`setItem/removeItem/clear`操作会触发`storage`事件，以`{key, oldValue, newValue}`作为实参调用callback。

    *当`removeItem`时，`newValue`为`null`；当`clear`时，`key, oldValue, newValue`均为`null`。*


examples:

    <!DOCTYPE html>
	<html lang="en">

	<head>
    <meta charset="UTF-8">
    <title>test</title>
    <script src="https://huainanhai.github.io/crossStore/crossStore.js"></script>
	</head>

	<body>
    TEST
    <script>

        crossStorage.setProxyUrl('https://huainanhai.github.io/crossStore');

        crossStorage.getItem('theme', (e) => {
            console.log('theme', e);
        });

        crossStorage.change(function (e) {
            console.log(e.oldValue, e.newValue);
        });

    </script>
	</body>

	</html>