var api = 'http://m2u-localhost/api_sort/'
// var api = 'https://demo2.superapp.my/api_sort/'
var uuid = 'u'+Math.random()
var balance = 100 // RM1

function fullfillment(redeemType, redeemCode) {
	// var vouchers = ["V1", "V2", "V3", "V4", "V5"];
	// if (vouchers.indexOf(redeemType)>=0) {
	// 	console.log('MBB redeem button goto voucher tnc', redeemType, redeemCode)
	if (redeemType == "V1") {
		console.log('MBB redeem button goto V1 tnc', redeemType, redeemCode)
	} else if (redeemType == "V2") {
		console.log('MBB redeem button goto V2 tnc', redeemType, redeemCode)
	} else if (redeemType == "V3") {
		console.log('MBB redeem button goto V3 tnc', redeemType, redeemCode)
	} else {
		console.log('MBB redeem button goto tnc', redeemType, redeemCode)
	}
	//TODO apply redeemCode (string) to redirect
}

$('#link-donate').click(function(e) {
    console.log('MBB donate button', prizeAmt)
    //TODO apply prizeAmt (int) to MBB donate app
})

$('.link-partners').click(function(e) {
    console.log('MBB to partners')
    //TODO to partners webpage
})

$('.link-tnc').click(function(e) {
    console.log('MBB to tnc')
    //TODO to tnc webpage
})

$('.link-more').click(function(e) {
    console.log('MBB to more tnx types')
    //TODO to more tnx types webpage
})

$('.link-close').click(function(e) {
    console.log('MBB to close game app')
    //TODO to close the game
})

!function(t,n){"object"==typeof exports?module.exports=exports=n():"function"==typeof define&&define.amd?define([],n):t.CryptoJS=n()}(this,function(){var t=t||function(t,n){var i=Object.create||function(){function t(){}return function(n){var i;return t.prototype=n,i=new t,t.prototype=null,i}}(),e={},r=e.lib={},o=r.Base=function(){return{extend:function(t){var n=i(this);return t&&n.mixIn(t),n.hasOwnProperty("init")&&this.init!==n.init||(n.init=function(){n.$super.init.apply(this,arguments)}),n.init.prototype=n,n.$super=this,n},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var n in t)t.hasOwnProperty(n)&&(this[n]=t[n]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),s=r.WordArray=o.extend({init:function(t,i){t=this.words=t||[],i!=n?this.sigBytes=i:this.sigBytes=4*t.length},toString:function(t){return(t||c).stringify(this)},concat:function(t){var n=this.words,i=t.words,e=this.sigBytes,r=t.sigBytes;if(this.clamp(),e%4)for(var o=0;o<r;o++){var s=i[o>>>2]>>>24-o%4*8&255;n[e+o>>>2]|=s<<24-(e+o)%4*8}else for(var o=0;o<r;o+=4)n[e+o>>>2]=i[o>>>2];return this.sigBytes+=r,this},clamp:function(){var n=this.words,i=this.sigBytes;n[i>>>2]&=4294967295<<32-i%4*8,n.length=t.ceil(i/4)},clone:function(){var t=o.clone.call(this);return t.words=this.words.slice(0),t},random:function(n){for(var i,e=[],r=function(n){var n=n,i=987654321,e=4294967295;return function(){i=36969*(65535&i)+(i>>16)&e,n=18e3*(65535&n)+(n>>16)&e;var r=(i<<16)+n&e;return r/=4294967296,r+=.5,r*(t.random()>.5?1:-1)}},o=0;o<n;o+=4){var a=r(4294967296*(i||t.random()));i=987654071*a(),e.push(4294967296*a()|0)}return new s.init(e,n)}}),a=e.enc={},c=a.Hex={stringify:function(t){for(var n=t.words,i=t.sigBytes,e=[],r=0;r<i;r++){var o=n[r>>>2]>>>24-r%4*8&255;e.push((o>>>4).toString(16)),e.push((15&o).toString(16))}return e.join("")},parse:function(t){for(var n=t.length,i=[],e=0;e<n;e+=2)i[e>>>3]|=parseInt(t.substr(e,2),16)<<24-e%8*4;return new s.init(i,n/2)}},u=a.Latin1={stringify:function(t){for(var n=t.words,i=t.sigBytes,e=[],r=0;r<i;r++){var o=n[r>>>2]>>>24-r%4*8&255;e.push(String.fromCharCode(o))}return e.join("")},parse:function(t){for(var n=t.length,i=[],e=0;e<n;e++)i[e>>>2]|=(255&t.charCodeAt(e))<<24-e%4*8;return new s.init(i,n)}},f=a.Utf8={stringify:function(t){try{return decodeURIComponent(escape(u.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return u.parse(unescape(encodeURIComponent(t)))}},h=r.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new s.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=f.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(n){var i=this._data,e=i.words,r=i.sigBytes,o=this.blockSize,a=4*o,c=r/a;c=n?t.ceil(c):t.max((0|c)-this._minBufferSize,0);var u=c*o,f=t.min(4*u,r);if(u){for(var h=0;h<u;h+=o)this._doProcessBlock(e,h);var p=e.splice(0,u);i.sigBytes-=f}return new s.init(p,f)},clone:function(){var t=o.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),p=(r.Hasher=h.extend({cfg:o.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){t&&this._append(t);var n=this._doFinalize();return n},blockSize:16,_createHelper:function(t){return function(n,i){return new t.init(i).finalize(n)}},_createHmacHelper:function(t){return function(n,i){return new p.HMAC.init(t,i).finalize(n)}}}),e.algo={});return e}(Math);return t});
!function(e,r){"object"==typeof exports?module.exports=exports=r(require("./core.min")):"function"==typeof define&&define.amd?define(["./core.min"],r):r(e.CryptoJS)}(this,function(e){return function(r){var t=e,n=t.lib,o=n.WordArray,i=n.Hasher,s=t.algo,a=[],c=[];!function(){function e(e){for(var t=r.sqrt(e),n=2;n<=t;n++)if(!(e%n))return!1;return!0}function t(e){return 4294967296*(e-(0|e))|0}for(var n=2,o=0;o<64;)e(n)&&(o<8&&(a[o]=t(r.pow(n,.5))),c[o]=t(r.pow(n,1/3)),o++),n++}();var f=[],h=s.SHA256=i.extend({_doReset:function(){this._hash=new o.init(a.slice(0))},_doProcessBlock:function(e,r){for(var t=this._hash.words,n=t[0],o=t[1],i=t[2],s=t[3],a=t[4],h=t[5],u=t[6],l=t[7],d=0;d<64;d++){if(d<16)f[d]=0|e[r+d];else{var _=f[d-15],p=(_<<25|_>>>7)^(_<<14|_>>>18)^_>>>3,v=f[d-2],H=(v<<15|v>>>17)^(v<<13|v>>>19)^v>>>10;f[d]=p+f[d-7]+H+f[d-16]}var y=a&h^~a&u,m=n&o^n&i^o&i,w=(n<<30|n>>>2)^(n<<19|n>>>13)^(n<<10|n>>>22),A=(a<<26|a>>>6)^(a<<21|a>>>11)^(a<<7|a>>>25),S=l+A+y+c[d]+f[d],g=w+m;l=u,u=h,h=a,a=s+S|0,s=i,i=o,o=n,n=S+g|0}t[0]=t[0]+n|0,t[1]=t[1]+o|0,t[2]=t[2]+i|0,t[3]=t[3]+s|0,t[4]=t[4]+a|0,t[5]=t[5]+h|0,t[6]=t[6]+u|0,t[7]=t[7]+l|0},_doFinalize:function(){var e=this._data,t=e.words,n=8*this._nDataBytes,o=8*e.sigBytes;return t[o>>>5]|=128<<24-o%32,t[(o+64>>>9<<4)+14]=r.floor(n/4294967296),t[(o+64>>>9<<4)+15]=n,e.sigBytes=4*t.length,this._process(),this._hash},clone:function(){var e=i.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA256=i._createHelper(h),t.HmacSHA256=i._createHmacHelper(h)}(Math),e.SHA256});

function jsonData() {
	var ts = Math.floor(Date.now()/1000);
    return {
        uid: uuid,
        ts: ts,
        signature: CryptoJS.SHA256(uuid + ts + gameToken).toString()
    };
}
var debug = false;
var sound = true;
// var mae = 1; //1 has mae account, 0 dont have
var theme = 0; //1 festive theme, 0 default
var gameStatus = 0; //1 on, 0 off
var chances = 0;
var totalScore = 0;
var week = 1;
var gameToken = null;
var playTS = null;
var playSignature = null;
var prizeType = null;
var prizeCode = null;
var prizeName = null;
var prizeAmt = 0;
var popupCount = 0;
var popup = null;

// phaser game
var gw, gh, obw, obh
var canStart = false;
var isPlaying = false;
var refreshRewards = true;
var refreshW1 = true;
var refreshW2 = true;
var refreshW3 = true;
var refreshW4 = true;
var totalScore;
var scoreText;
// var timeLabel1;
// var timeLabel2;
var timeText;
var timeInSeconds;
var timer;
var tweens;
var timerAnimation;
var coin;
var bomb;
var emitter, emitter2;
var gameLimit;
var noOfCoins;
var signature;
var ts;
var coinsGroup;
var bg;
var speedPlus;
var scoreSound, loseSound, bgSound
var basket = shuffle([0,1,2,3]);
var screen;

var Interim = new Phaser.Class({

Extends: Phaser.Scene,

initialize:

function Interim ()
{
    Phaser.Scene.call(this, { key: 'interim' });
},

preload: function () {

}

})

var PlayGame = new Phaser.Class({

Extends: Phaser.Scene,

initialize:

function PlayGame ()
{
    Phaser.Scene.call(this, { key: 'playGame' });
},

preload: function ()
{
    gw = this.scale.width
    gh = this.scale.height
    obw = gw / 5
    obh = gh / 9
    // console.log(gw+"x"+gh)
    this.load.image('o0', 'img/o0.png');
    this.load.image('o10', 'img/o10.png');
    this.load.image('o20', 'img/o20.png');
    this.load.image('o30', 'img/o30.png');
    this.load.image('o11', 'img/o11.png');
    this.load.image('o21', 'img/o21.png');
    this.load.image('o31', 'img/o31.png');
    this.load.image('o12', 'img/o12.png');
    this.load.image('o22', 'img/o22.png');
    this.load.image('o32', 'img/o32.png');
    this.load.image('o13', 'img/o13.png');
    this.load.image('o23', 'img/o23.png');
    this.load.image('o33', 'img/o33.png');
    this.load.image('c0', 'img/c0.png');
    this.load.image('c1', 'img/c1.png');
    this.load.image('c2', 'img/c2.png');
    this.load.image('c3', 'img/c3.png');

    this.load.audio('bgSound', 'mp3/bg.mp3')
    this.load.audio('scoreSound', 'mp3/score.mp3')
    this.load.audio('loseSound', 'mp3/lose.mp3')

},

create: function ()
{
    screen = this
    // isPlaying = true

    timeInSeconds = 30
    totalScore = 0
    noOfCoins = 10
    speedPlus = 0

    // timeLabel1 = this.add.text(gw / 2, 110, 'POINTS', { fontFamily: "Gotham", fontSize: 26, color: "#333333" });
    // timeLabel1.setOrigin(0.5, 0.5)
    // timeLabel2 = this.add.text(gw / 2, 140, 'TIME', { fontFamily: "Gotham", fontSize: 26, color: "#DD3300" });
    // timeLabel2.setOrigin(0.5, 0.5)
    
    timeText = this.add.text(gw - obw, obh/3, '00:' + timeInSeconds, { fontFamily: "Gotham", fontSize: 32, color: "#FF000A" });
    timeText.setOrigin(0.5, 0.5)

    timer = this.time.addEvent({
        delay: 1000,
        callback: tick,
        loop: true
    })

    timerAnimation = this.tweens.add({
        targets: timeText,
        duration: 500,
        delay: 700,
        scaleX: 1.1,
        scaleY: 1.1,
        ease: 'Liner',
        repeat: -1,
        yoyo: true,
  
    })
    // scoreText = this.add.text(obw, obh/2, totalScore, { fontFamily: "Gotham", fontSize: 45, color: "#333333" });
    // scoreText.setOrigin(0.5, 0.5)

    this.add.sprite(obw, gh-obh, 'c'+basket[0]).setInteractive().setDisplaySize(obw, obh)
    this.add.sprite(obw+obw, gh-obh, 'c'+basket[1]).setInteractive().setDisplaySize(obw, obh)
    this.add.sprite(obw+obw*2, gh-obh, 'c'+basket[2]).setInteractive().setDisplaySize(obw, obh)
    this.add.sprite(obw+obw*3, gh-obh, 'c'+basket[3]).setInteractive().setDisplaySize(obw, obh)

    var delay = 0;
    coinsGroup = this.add.group()

    for (var i = 0; i < noOfCoins; i++)
    {
        var r = Phaser.Math.Between(1, 10)
        var type = (r % 3) + 1
        // if (r == 7) type = 0
        coin = this.add.sprite(obw*Phaser.Math.Between(1, 4) , -(i*obh), 'o'+type+''+Phaser.Math.Between(0, 3)).setName(type).setInteractive().setDisplaySize(obw, obh)
        this.input.setDraggable(coin)
        coinsGroup.add(coin)
        coin.visible = false
    }


    // this.input.setDraggable(image);

    this.input.dragDistanceThreshold = 16;

    this.input.on('dragstart', function (pointer, gameObject) {
        if (gameObject) gameObject.setTint(0x996666);
    });

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        // gameObject.y = dragY;
    });

    this.input.on('dragend', function (pointer, gameObject) {
        gameObject.clearTint();
        if (gameObject.x > obw*3.5)
            gameObject.x = obw*4
        else if (gameObject.x > obw*2.5)
            gameObject.x = obw*3
        else if (gameObject.x > obw*1.5)
            gameObject.x = obw*2
        else
            gameObject.x = obw
    });
    bgSound = this.sound.add('bgSound')
    scoreSound = this.sound.add('scoreSound')
    loseSound = this.sound.add('loseSound')
    if(sound) bgSound.play()
},

update: function ()
{
    if(isPlaying) {
        var pointer = this.input.activePointer
        for (i=0; i<coinsGroup.getChildren().length; i++) {
            coin = coinsGroup.getChildren()[i]
            coin.y += (gh/500 + speedPlus/1.7)

            if (coin.y > gh) {
                var r = Phaser.Math.Between(1, 7)
                var type = (r % 3) + 1
                if (r == 7) {
                    type = 0
                    coin.setName(type).setTexture('o0')
                } else {
                    coin.setName(type).setTexture('o'+type+''+Phaser.Math.Between(0, 3))
                }
                
                coin.x = obw*Phaser.Math.Between(1, 4)
                coin.y = coin.y - (gh + obh)

                if (i==0) {
                    speedPlus++
                    console.log(gh/500 + speedPlus/1.7)
                }
            } else if (coin.y > (gh - obh*1.5) && coin.visible) {
                coin.visible = false
                if (coin.x > obw*3.5) {
                    score(3, parseInt(coin.name))
                } else if (coin.x > obw*2.5) {
                    score(2, parseInt(coin.name))
                } else if (coin.x > obw*1.5) {
                    score(1, parseInt(coin.name))
                } else {
                    score(0, parseInt(coin.name))
                }
                if (totalScore < 0) totalScore = 0
                // scoreText.setText(totalScore)
            } else if (coin.y > (gh - (obh*2.5))) {
            //     coin.input.enabled = false
            //     if (pointer && pointer.isDown) {
            //         this.input.emit('dragend', pointer, coin)
                    // this.input.emit('dragstart', pointer, null)
                    // this.input.emit('gameobjectup', pointer, coin)
                    // coin.removeInteractive()
                // }
                // coin.setTint(0x999999)
            } else if (coin.y > obh && !coin.visible) {
                coin.visible = true
                coin.input.enabled = true
                // coin.setTint(0xFFFFFF)
            }
        }
    }
}

});

function tick() {
    if(isPlaying) {
        timeInSeconds--;
        var minutes = Math.floor(timeInSeconds / 60);
        var seconds = timeInSeconds - (minutes * 60);
        var timeString = addZeros(minutes) + ":" + addZeros(seconds);
        timeText.setText(timeString);

        if (timeInSeconds == 0) {
            gameover()
        }
    }
}

function gamestart() {
	$('.bg-game').removeClass('blur')
    $('canvas').removeClass('display-none')
    basket = shuffle([0,1,2,3]);
    isPlaying = true
    game.scene.start('playGame')
}

function gameover() {
    isPlaying = false
    timer.paused = true
    timer.remove()
    timerAnimation.stop()
    // game.scene.pause("playGame")
    game.scene.stop()
    game.scene.start('interim');
    $('canvas').addClass('display-none')
    $('.bg-game').addClass('blur')

    serverCall('POST','/end.php',{uid: uuid, ts: playTS, signature: playSignature, score: totalScore, balance: balance}, {}, function(res) {
        if(sound) bgSound.stop()
        chances = parseInt(res.data.chances)
        totalAcc = parseInt(res.data.total)
        totalScore = parseInt(res.data.score)
        prizeType = res.data.type
        prizeName = res.data.prize
        if (prizeType) refreshRewards = true

        showResult()

        return false;
    })
}

function score(pos, name) {
    if (basket[pos] == name) {
        if (name > 0) {
            totalScore += 5
            if(sound) scoreSound.play()
        }
    } else {
        if (name == 0) gameover()
        else {
            totalScore -= 5
            if(sound) loseSound.play()
        }
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function addZeros(num) {
    if (num < 10) {
        num = "0" + num;
    }
    return num;
}

var config = {
    type: Phaser.AUTO,
    width: gw, 
    height: gh,
    autoStart: false,
    scale: {
        parent: 'game',
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%'
    },
    render: {
        powerPreference: "high-performance",
        transparent: true,
    },
    scene: [Interim, PlayGame],
    // fps: {
    //     min: 20,
    //     target: 60,
    //     forceSetTimeOut: true,
    //     deltaHistory: 10,
    // },
};

var game = new Phaser.Game(config)
// phaser game

if (debug) console.log(uuid)
serverCall('POST', 'home.php', Object.assign(jsonData(),{'source':'A'}), {}, function(res) {
	chances = parseInt(res.data.chances)
	totalAcc = parseInt(res.data.total)
    week = parseInt(res.data.week)
	theme = parseInt(res.data.theme)
	gameStatus = parseInt(res.data.status)
	gameToken = res.data.token
    popup = res.data.notify
    popupCount = popup.length

	$('#chances').html(chances)
	$('#your-score').html(totalAcc)
	if (chances <= 0) $('.btn-play').addClass('inactive').removeClass('zoom')
	else canStart = true

    home()
})

function serverCall(method, endpoint, data, headers, cb) {
	var t = new Date()
	if(endpoint == 'play.php')
		showPopup('Getting ready to start', false)
	else
		$('.loading').removeClass('display-none')

	if (debug) console.log('request payload', data);
	$.ajax({
	    type: method,
	    url: api + endpoint,
	    cache: false,
	    data: data,
	    headers: headers,
	    success: function (resp) {
	        if (debug) console.log((new Date()).getTime()-t,resp)
	        $('.loading').addClass('display-none')
	        $('.msg').addClass('display-none')

	        if (resp.status_code !== 200) {
	            console.log("ajax response", resp.error)
	            showPopup(msg[parseInt(resp.status_code)], true)
	        } else {
	            cb(resp);
	        }
	    },
	    error: function (xhr, ajaxOptions, thrownError) {
	        console.log("ajax error", xhr.status);
	        showPopup(msg[1], true)
	    }
	});
}
var msg = new Array();
msg[401] = 'Something went wrong (401)' //Failed to create user
msg[402] = 'Something went wrong (402)' //No user defined
msg[411] = 'Something went wrong (411)' //Invalid signature
msg[415] = 'Something went wrong (415)' //Invalid timestamp
msg[432] = 'Something went wrong (432)' //Failed to start a game
msg[433] = 'Something went wrong (433)' //No balance defined
msg[438] = 'Something went wrong (438)' //Balance is maxed out
msg[439] = 'Something went wrong (439)' //User is blocked
msg[440] = 'Something went wrong (440)' //Game off
msg[443] = 'Something went wrong (443)' //Failed to update score
msg[444] = 'Something went wrong (444)' //No play record found
msg[501] = 'Something went wrong (501)' //Failed to connect to mySQL
msg[431] = 'You don’t have any chances left'
msg[0] = 'You don’t have any chances left'
msg[1] = 'Something went wrong'

function showPopup(msg, err) {
	$('#msg').html(msg)
	if (err) {
		$('.msg').removeClass('display-none')
	} else {
		$('#msg').removeClass('display-none')
	}
}

var soundLoad = true
const soundBGM = new Audio();
const soundGG0 = new Audio();
const soundGG1 = new Audio();
const soundGGB = new Audio();

function bgm() {
    if(!sound) return false
	if (soundLoad) {
		soundLoad = false
		// soundBGM.src = 'mp3/bg.mp3'
		// soundBGM.loop = true
		// soundBGM.play()
		soundGG0.play()
		soundGG1.play()
		soundGGB.play()

		soundGG0.pause()
		soundGG1.pause()
		soundGGB.pause()
		soundGG0.src = 'mp3/gg_lose.mp3'
		soundGG1.src = 'mp3/gg_win.mp3'
		soundGGB.src = 'mp3/gg_bomb.mp3'
	}
	// soundBGM.play()
}

function home() {
    $('.section').addClass('display-none')
    $('.menu-item a').removeClass('active')
    $('#menu-home a').addClass('active')
    $('#menu').removeClass('display-none')
    $('#chances').html(chances)
    $('#your-score').html(totalAcc)
    if (gameStatus > 0)
        $('#section-home').removeClass('display-none')
    else
        $('#section-stop').removeClass('display-none')
    if (popupCount > 0) showTop()
}

function rewards() {
    $('.section').addClass('display-none')
    $('.menu-item a').removeClass('active')
    $('#menu-reward a').addClass('active')
    $('#menu').removeClass('display-none')
    $('#section-rewards').removeClass('display-none')
    showPrizes()
}
function reward(type, code, title) {
    $('.section').addClass('display-none')
    $('#section-prize-tnc').removeClass('display-none')
    $('.reward-tnc').addClass('display-none')

    $('.reward-title').html('<table><tr><td class="td-logo"><img src="img/prize'+type+'.png"></td><td class="td-title"><b>'+title+'</b></td></tr></table>')
    $('#reward-code').html('<b>'+code+'</b>')
    $('#reward-tnc-'+type).removeClass('display-none')
}
function prizes(type, code, title) {
    $('.section').addClass('display-none')
    $('.menu-item a').removeClass('active')
    $('#menu-prize a').addClass('active')
    $('#menu').removeClass('display-none')
    $('#section-prizes').removeClass('display-none')
}
function leaderboard(w) {
    $('.section').addClass('display-none')
    $('.menu-item a').removeClass('active')
    $('#menu-leaderboard a').addClass('active')
    $('#menu-week'+w+' a').addClass('active')
    $('#menu').removeClass('display-none')
    $('#section-leaderboard').removeClass('display-none')
    $('.lb-list').addClass('display-none')
    $('#lb-list'+w).removeClass('display-none')
    showLeaderboard(w)
}
function showLeaderboard(w) {
    if ((w == 1 && !refreshW1) || (w == 2 && !refreshW2) || (w == 3 && !refreshW3) || (w == 4 && !refreshW4)) return false
    serverCall('POST', 'leaderboard.php', Object.assign(jsonData(),{'lb':w}), {}, function(res) {
        if (w > 0 && w != week) {
            if (w == 1) refreshW1 = false
            if (w == 2) refreshW2 = false
            if (w == 3) refreshW3 = false
            if (w == 4) refreshW4 = false
        }
        if (res.data.list) {
            
            var data = res.data.list
            tmp = '<div class="lb-name"><b>Player Rank</b></div><div class="lb-score"><b>Score</b></div><div class="lb-line"></div>'
            for (var i = 0; i < data.length; i++) {

                tmp += '<div class="lb-name"><div class="lb-number">'+(i+1)+'</div>'+data[i].uid+'</div><div class="lb-score">'+data[i].score+'</div><div class="lb-line"></div>'
            }
            $('#lb-list'+w).html(tmp)
        } else {
            $('#lb-list'+w).html('<div>No date yet.</div>')
        }
    })
}

function showPrizes() {
    if (!refreshRewards) return false
    serverCall('POST', 'prizes.php', jsonData(), {}, function(res) {
        refreshRewards = false
        if (res.data.prizes) {
            
            var data = res.data.prizes
            tmp = '<div>View all the rewards you\'ve won here.<br>Tap for more details.</div><br>'
            for (var i = 0; i < data.length; i++) {

				tmp += '<div class="prize-item" code="'+data[i].code+'" type="'+data[i].type+'" title="'+data[i].name+'"><table><tr><td class="td-logo"><img src="img/prize'+data[i].type+'.png"></td><td class="td-title"><b>' + data[i].name + '</b>'
                if (data[i].type == "C") tmp += '<br>RM' + data[i].code
                tmp += '</td></tr></table></div>'
            }
            $('#prize-list').html(tmp)
        } else {
        	$('#prize-list').html('<div>No Rewards Won Yet.</div>')
        }
    })
}

function showResult() {
	$('#frame-prize').attr('src', 'img/frame-prize.png')
	$('.prize-score').removeClass('vhidden')
	$('.prize0').addClass('display-none')
	$('.prize1').removeClass('display-none')
	$('#prize').removeClass('display-none')
	$('#prize-desc').html('')
	$('#prize-score').html(totalScore)
	// soundBGM.pause()
	// setTimeout(function(){ if(sound) soundBGM.play() }, 1700)

	switch(prizeType) {
		case null:
			if (timeInSeconds === 0) {
                if(sound) soundGG0.play()
				$('#prize').addClass('display-none')
				$('#prize-desc').html('Sorry, you need to score a minimum of 100 points to get a reward. Try another feature on the app for another chance to win.')
			} else {
                if(sound) soundGGB.play()
				$('.prize-score').addClass('vhidden')
				$('#frame-prize').attr('src', 'img/frame-gg.png')
				$('#prize').attr('src', 'img/prize0.png')
				$('#prize-desc').html('Oops, remember to sort the bomb into the Bomb Bin next time!')
			}

			$('.prize1').addClass('display-none')
			$('.prize0').removeClass('display-none')

			// $('.prize-content').addClass('display-none')
			// $('.sorry-content').removeClass('display-none')
			// $('#sorry-footer').removeClass('display-none')
			// $('.prize-frame').addClass('display-none')
			break
		// case 'G1':
		// case 'G2':
		// 	$('#prize-desc').html('<br>Go to <b>My Prizes</b> and click<br><b>Learn More</b> for further info.')
		// 	break

		case 'V1':
		case 'V2':
		case 'V3':
		case 'V4':
		case 'V5':
			if(sound) soundGG1.play()
			$('#prize').attr('src', 'img/prize'+prizeType+'.png')
			$('#prize-desc').html('Congratulations, you’ve won a<br><b>'+prizeName+'</b> mini voucher!')
			break
		case 'C1':
		case 'C5':
		case 'C10':
		case 'C20':
		case 'C50':
		case 'C100':
		case 'C200':
		case 'C300':
		case 'C500':
			if(sound) soundGG1.play()
			$('#prize').attr('src', 'img/prizeC.png')
			$('#prize-desc').html('Congratulations, you\'ve won<br><b>'+prizeName+'</b>')
			break
		default:
			break
	}
	$('#section-prize').removeClass('display-none')
	canStart = true
}


function showTop() {
    if (popupCount > 0) {
        type = popup[popupCount-1].type
        name = popup[popupCount-1].name

        switch(type) {
            case 'G':
                $('#frame-top').attr('src', 'img/frame-grand.png')
                $('#top-prize').attr('src', 'img/prizeG.png')
                $('#top-desc').html('We know a winner when we see one! Enjoy your life-changing treat.')
                break
            case 'T':
                $('#frame-top').attr('src', 'img/frame-top10.png')
                $('#top-prize').attr('src', 'img/prizeT.png')
                $('#top-desc').html('It\'s your lucky day! Enjoy a<br><b>'+name+'</b> on us.')
                break
            case '1':
            case '2':
            case '3':
                $('#frame-top').attr('src', 'img/frame-top.png')
                $('#top-prize').attr('src', 'img/prizeW'+type+'.png')
                $('#top-desc').html('Congratulations, enjoy a<br><b>'+name+'</b> on us!')
                break
            default:
                break
        }
        $('#section-top').removeClass('display-none')
        popupCount--
    } else {
        home()
    }
}

$(document).ready(function(){
$('canvas').addClass('display-none');
    $('#link-keep, .link-mae, .btn-home').click(function(){
        // bgm()
        if (canStart) {
        	// soundBGM.pause()
            home()
        }
    })

    $('.pop-close').click(function(){
        showTop()
    })

    $('.btn-play').click(function(){
        bgm()
        if (canStart && gameStatus > 0 && chances > 0) {
			serverCall('POST', 'play.php', jsonData(), {}, function(res) {
				$('.section').addClass('display-none')
				chances = parseInt(res.data.chances)
				playTS = res.data.ts
				playSignature = res.data.signature

				gamestart()
			})
        } else if (chances <= 0) {
        	showPopup(msg[0], true)
        }
    })

    $('.link-prizes, .link-prizes, .btn-prizes').click(function(){
    	if (canStart) {
	        // soundBGM.pause()
	        rewards()
    	}
    })

    $('.link-how').click(function(){
	    $('.howto').removeClass('display-none')
    })
    $('.link-close-how').click(function(){
	    $('.howto').addClass('display-none')
    })
    $('.link-close-reward').click(function(){
        rewards()
    })

	$('.msg').click(function(){
		$('.msg').addClass('display-none')
	})
    $('#menu-home').click(function(){
        home()
    })
    $('#menu-reward').click(function(){
        rewards()
    })
    $('#menu-prize').click(function(){
        prizes()
    })
    $('#menu-leaderboard').click(function(){
        leaderboard(week)
    })

    $('#menu-week1').click(function(){
        leaderboard(1)
    })
    $('#menu-week2').click(function(){
        leaderboard(2)
    })
    $('#menu-week3').click(function(){
        leaderboard(3)
    })
    $('#menu-week4').click(function(){
        leaderboard(4)
    })
    $('#menu-week0').click(function(){
        leaderboard(0)
    })

	$(document).on('click', '.link-redeem', function(e) {
		var redeemCode = $(this).attr('code')
		var redeemType = $(this).attr('code2')
		fullfillment(redeemType, redeemCode)
	})

    $(document).on('click', '.prize-item', function(e) {
        if ($(this).attr('type') != "C") {
            reward($(this).attr('type'), $(this).attr('code'), $(this).attr('title'))
            // console.log($(this).attr('code'))
        }
    })

})