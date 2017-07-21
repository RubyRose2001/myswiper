;(function(){
	var  defaluts={
			loop:false,						//是否无缝
			autoplay:false,					//是否自动轮播
			pagination:false,				//是否有按钮			
			btnClick:false,					//按钮是否可以点击
			success:null,					//接收Function(i){} i是当前下标						
	}
	function Myswiper(elements,options){
		//判断是元素 还是对象
		this.el=typeof elements == "string" ? document.querySelector(elements) : elements;
		this.wrapper=this.el.querySelector(".swiper-wrapper")
		this.slide=this.el.querySelectorAll(".swiper-slide")
		this.options=this.extend({},defaluts,options)
		this.init()
		this.config()
		this.start()
		this.move()
		this.end()
	}
	Myswiper.prototype={
		constructor:Myswiper,
		//css样式修改
		defaultStyle:function(){
		},
		//样式初始默认值
		init:function(){
			//手指触摸下位置
			this.startX=0;
			this.endX=0;
			this.moveX=0;
			this.startY=0;
			this.endY=0;
			this.moveY=0;
			this.flagY=null;					//判断手指滑动的方向是Y轴
			this.flagX=null;					//判断手指滑动的方向是X轴
			this.le=this.slide.length;  		//this.slide的长度
			this.w=this.slide[0].offsetWidth;	//一个this.slide宽度
			this.index=0;   					//下标
			this.startTime=0;					//手指触摸时间
			this.endTime=0;						//手指离开时间
			this.timer=null;					//定时器
			
		},
		//配置
		config:function(){
			if(this.options.pagination){
				this.btn=document.querySelector(".swiper-btn");
				var str=""
				for(var i=0;i<this.le;i++){
					if(i===0){
						str+="<span class='active'></span>"
					}else{
						str+="<span></span>"
					}
					
				}
				this.btn.innerHTML=str
				this.button=this.btn.querySelectorAll("span");
			}
			if(this.options.pagination && this.options.btnClick){
				this.btnClick()
			}
			if(this.options.autoplay){
				this.autoplay()
			}
			if(this.options.loop){
				for(var i=0;i<this.le;i++){
					this.slide[i].setAttribute("index",i)
				}
				newfirst=this.slide[0].cloneNode(true);
				newlast=this.slide[this.le-1].cloneNode(true);
				this.wrapper.appendChild(newfirst)
				this.wrapper.insertBefore(newlast,this.slide[0])
				this.slide=this.el.querySelectorAll(".swiper-slide")
				this.le=this.slide.length;
				this.index=1
				this.krnelDriver(this.index)
			}
		},
		//触摸开始
		start:function(){
			this.wrapper.addEventListener("touchstart",function(e){
				this.wrapper.style.transition="none";
				this.flagY=true;
				this.flagX=true;
				this.startX=e.changedTouches[0].pageX;
				this.startY=e.changedTouches[0].pageY;
				this.startTime=new Date()
				//如果autoplay有参数 清楚定时器
				if(this.options.autoplay){
					clearInterval(this.timer)
				}	
				if(this.index>=this.le-1 && this.options.loop){
					this.index=1
					var distance=this.endX=this.index*-this.w
					this.wrapper.style.transform="translate3D("+distance+"px,0,0)";
				}
				if(this.index<=0 && this.options.loop){
					this.index=this.le-2
					var distance=this.endX=this.index*-this.w
					this.wrapper.style.transform="translate3D("+distance+"px,0,0)";
				}
			}.bind(this),false)
		},
		//手指触摸移动
		move:function(){
			this.wrapper.addEventListener("touchmove",function(e){
				if(!this.flagY) return false;
				this.moveX=e.changedTouches[0].pageX-this.startX;
				this.moveY=e.changedTouches[0].pageY-this.startY;
				if(this.flagX && Math.abs(this.moveY)>Math.abs(this.moveX)){
					this.flagY=false;
				}else{
					this.flagX=false
				}
				if(!this.options.loop &&this.index==0 && this.moveX>0){
					return false;
				}else if(!this.options.loop && this.index==this.le-1 && this.moveX<0){
					return false;
				}
				this.transtion(this.wrapper,this.moveX+this.endX)
			}.bind(this),false)
		},
		//手指离开屏幕
		end:function(){
			this.wrapper.addEventListener("touchend",function(e){
				if(!this.flagY) return false;
				this.wrapper.style.transition="0.5s"
				this.endX=e.changedTouches[0].pageX;
				this.endTime=new Date();
				var range=this.endX-this.startX;
				//快速向左滑动			
				if(this.endTime-this.startTime<200 && range<0){
					this.indexUp()
					this.krnelDriver(this.index)
					return false
				}
				//快速向右滑动
				if(this.endTime-this.startTime<200 && range>0){
					this.indexDown()
					this.krnelDriver(this.index)
					return false
				}
				//有参数调用就就调用计时器
				if(this.options.autoplay){
					this.autoplay()
				}
				//左划
				if(range<-this.w/2){
					this.indexUp()
					this.krnelDriver(this.index)
					return false
				}
				//右划
				if(range>this.w/2){
					this.indexDown()
					this.krnelDriver(this.index)
					return false
				}
				   // 待商榷
				this.krnelDriver(this.index)
			}.bind(this),false)
		},
		//下标判断
		indexUp:function(){
			if(!this.options.loop && !this.options.autoplay){
				this.index = this.index >= this.le-1 ? this.le-1 : ++this.index;
				return false
			}else if(!this.options.loop && this.options.autoplay){
				this.index = this.index >= this.le-1 ? 0 : ++this.index;
				return false
			}
			++this.index
		},
		indexDown:function(){
			if(!this.options.loop){
				this.index = this.index <= 0 ? 0 : --this.index;
				return false
			}
			--this.index
		},
		//下标驱动
		krnelDriver:function(index){
			//结束距离
			var distance=this.endX=index*-this.w
			this.wrapper.style.transform="translate3D("+distance+"px,0,0)";
			this.success()
			this.btnIndex()
		},
		transtion:function(el,x){
			el.style.transform="translate3D("+x+"px,0,0)"
			return this;
		},
		//自动轮播
		autoplay:function(){
			this.timer=setInterval(function(){
				if(this.index>=this.le-1 && this.options.loop){
					this.wrapper.style.transition="none";
					this.index=1
					this.krnelDriver(this.index)
				}
				setTimeout(function(){
					this.wrapper.style.transition="0.5s";
					this.indexUp();
					this.krnelDriver(this.index);
				}.bind(this),0)
			}.bind(this), this.options.autoplay)
		},
		//会掉函数
		success:function(){
			if(!this.options.success) return ;
			var ind = this.slide[this.index].getAttribute("index") || this.index;
			this.options.success(ind)
		},
		//按钮下标切换
		btnIndex:function(){
			if(!this.options.pagination) return;
			var ind = this.slide[this.index].getAttribute("index") || this.index;
			for(var i=0; i<this.button.length;i++){
				this.button[i].className="";
			}
			this.button[ind].className="active"
		},
		//点击按钮操作
		btnClick:function(){
			var _this=this
			for(var i=0;i<this.button.length;i++){
				(function(i){
					this.button[i].onclick=function(){
						this.wrapper.style.transition="0.5s"
						this.index=this.options.loop ? i+1 : i;
						this.krnelDriver(this.index)
					}.bind(this)
				}.bind(this))(i)
			}
		},
		//浅拷贝
		extend:function(){
			for(var i=1;i<arguments.length;i++){
				for(var j in arguments[i]){
					arguments[0][j]=arguments[i][j]
				}
			}
			return arguments[0]
		}
	};
	window.Myswiper = Myswiper;
})(window)