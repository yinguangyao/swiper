## Swiper
 I rewrite thebird's swipe by React, so this is a React component of mobile swipe.
 Here is thebird's swipe: https://github.com/thebird/Swipe
### demo
Here is URL: https://yinguangyao.github.io/swiper/build/
### run
```
npm install
npm start
```
### Usage
```
<Swiper>
	<img src="" alt="" style={{width: "100%"}} />
	<img src="" alt="" style={{width: "100%"}} />
	<img src="" alt="" style={{width: "100%"}} />
</Swiper>
```
You must use a few styles like this:
```
* {
    margin: 0;
    padding: 0;
}
.swiper {
    width: 100%;
    overflow: hidden;
    position: relative;
    .swiper-wrap {
        zoom: 1;
        &::after{
            content: "";
            display: table;
            clear: both;
            height: 0;
        }
        img, div {
            position: relative;
            float: left;
            height: 180px;
            width: 100%;
        }
        img {
            max-width: 100%;
        }
    }
    .swiper-dot {
        position: absolute;
        bottom: 10px;
        z-index: 100px;
        left: 42%;  
        margin: 0 auto;
        text-align: center;
        span {
            border-radius: 50%;
            background-color: white;
            border: 1px solid gray;
            width: 10px;
            height: 10px;
            margin-right: 8px;
            float: left;
        }
        .cur {
            background-color: gray;
        }
    }
}
```
notice: classname must be these.
### Props
+ startSlide Integer (default:0) - index position Swipe should start at

+ speed Integer (default:300) - speed of prev and next transitions in milliseconds.

+ auto Integer - begin with auto slideshow (time in milliseconds between slides)

+ continuous Boolean (default:true) - create an infinite feel with no endpoints

+ disableScroll Boolean (default:false) - stop any touches on this container from scrolling the page

+ callback Function - runs at slide change.

+ transitionEnd Function - runs at the end slide transition.
