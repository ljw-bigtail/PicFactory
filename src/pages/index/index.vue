<template>
  <BaseLayout>
    <template v-slot:header>
      <span>Leo's Home</span>
    </template>
    <template v-slot:menu>
      <button class="button C">
        <a href="./gif.html">Pic GIF</a>
      </button>
      <button class="button C">
        <a href="./collage.html">Pic Collage</a>
      </button>
      <button class="button B">
        <a href="/blog/">Leo's Blog</a>
      </button>
    </template>
    <template v-slot:main>
      <div class="slogin">
        <span>终</span>
        <span>身</span>
        <div>
          <span class="piece-graph-1"></span>
          <span>学</span>
        </div>
        <span>习</span>
        <div class="enter">
          <div class="enter-val">
            <p>Never</p>
            <p>Stop</p>
            <p>Learning</p>
          </div>
          <div class="enter-button">
            <div class="arrow float-fly">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="piece">
        <span class="piece-graph-2"></span>
      </div>
      <ul class="nav">
        <li>
          <span class="piece-graph-3"></span>
          <a href="/blog/">
            <h3>FE Store</h3>
            <div class="icon"></div>
          </a>
        </li>
        <li>
          <span class="piece-graph-4"></span>
          <a href="/blog/categories/%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0/">
            <h3>Reads</h3>
            <div class="icon"></div>
          </a>
        </li>
        <li>
          <a href="./gif.html">
            <h3>Pic Factory</h3>
            <div class="icon"></div>
          </a>
        </li>
        <li>
          <a href="javascript:void(0)" @click="addTip('Coming Soon')">
            <h3>Piece</h3>
            <div class="icon"></div>
          </a>
        </li>
      </ul>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from "../../layouts/BaseLayout.vue";

const addTip = function (mes: string) {
  alert(mes);
};
</script>

<style lang="less" scoped>
.gif-preview {
  max-width: 300px;
  min-height: 400px;
  display: block;
  margin: 0 auto var(--space-1);
  box-shadow: var(--shadow);
  img {
    display: inline-block;
    max-width: 100%;
  }
}

.slogin {
  font-size: 120px;
  display: flex;
  flex-direction: column;
  overflow: initial;
  position: relative;
  > span {
    display: block;
    margin: 10px 0;
  }
  > div:not(.enter) {
    position: relative;
    margin-top: 130px;
    transform: translateX(140px);
    .piece-graph-1 {
      position: absolute;
      transform: translateX(calc(-100% - 20px)) translateY(-100%);
    }
  }
  .enter {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(-100%);
    font-size: initial;
    text-align: left;
    display: flex;
    align-items: flex-end;
    .enter-val {
      margin-left: 20px;
      p {
        line-height: 1.4em;
      }
    }
    .enter-button {
      @enter-size: 72px;
      background-color: var(--color-D);
      border-radius: 50%;
      width: @enter-size;
      height: @enter-size;
      margin-left: 30px;
      .arrow {
        transform: rotateZ(90deg) translateX(42%);
        &.float-fly {
          @keyframes float-fly {
            0% {
              transform: rotateZ(90deg) translateX(22%);
            }
            50% {
              transform: rotateZ(90deg) translateX(42%);
            }
            100% {
              transform: rotateZ(90deg) translateX(22%);
            }
          }
          animation: float-fly 4s infinite ease-in-out;
        }
        span {
          @arrow-size: @enter-size * 0.72;
          display: block;
          width: @arrow-size;
          height: 2px;
          background-color: #000;
          position: absolute;
          &:nth-child(1) {
            transform: rotateZ(45deg);
            transform-origin: 100% 50%;
          }
          &:nth-child(2) {
            width: @arrow-size * 1.4;
            transform: translateX(@arrow-size * -0.4);
          }
          &:nth-child(3) {
            transform: rotateZ(-45deg) translateX(-0.5px) translateY(-0.5px);
            transform-origin: 100% -50%;
          }
        }
      }
    }
  }
}

.piece {
  margin: 54px 60px 0;
}

.nav {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  flex: 1;
  height: 100%;
  li {
    @li-link-height: 680px;
    @li-link-width: 180px;
    position: relative;
    display: block;
    width: @li-link-width;
    height: @li-link-height;
    margin-left: 20px;
    border-top-left-radius: @li-link-width * 0.5;
    border-top-right-radius: @li-link-width * 0.5;
    &:hover {
      transform: scale(1.05);
      transition: all 0.3s;
      transform-origin: 50%;
    }
    a {
      height: 100%;
      display: flex;
      justify-content: center;
      position: relative;
      h3 {
        transform: rotateZ(-90deg);
        display: block;
        font-size: 80px;
        font-weight: 500;
        word-wrap: initial;
        word-break: keep-all;
        white-space: nowrap;
        position: absolute;
        top: 50%;
        overflow: hidden;
        font-weight: 300;
      }
      .icon {
        margin-top: 50%;
        &::before,
        &::after {
          content: "";
          width: @li-link-width * 0.5;
          height: 2px;
          display: block;
          background-color: var(--color-black);
        }
        &::after {
          transform: rotateZ(90deg);
        }
      }
    }
    &:nth-child(1) {
      background-color: var(--color-A);
    }
    &:nth-child(2) {
      background-color: var(--color-B);
      height: @li-link-height * 0.8;
      h3 {
        top: 58%;
      }
    }
    &:nth-child(3) {
      background-color: var(--color-black);
      height: @li-link-height * 1.2;
      h3 {
        color: var(--color-white);
      }
      .icon {
        &::before,
        &::after {
          background-color: var(--color-white);
        }
      }
    }
    &:nth-child(4) {
      height: @li-link-height * 0.9;
      background-color: var(--color-C);
    }
    .piece-graph-3,
    .piece-graph-4 {
      position: absolute;
    }
    .piece-graph-3 {
      top: 40%;
      left: -60%;
    }
    .piece-graph-4 {
      top: -18%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

.piece-graph-1 {
  @triangle-size: 54px;
  @triangle-color: #000;

  display: block;
  width: 0;
  height: 0;
  border-top: @triangle-size*1.732 solid transparent;
  border-left: @triangle-size solid transparent;
  border-right: @triangle-size solid transparent;
  border-bottom: @triangle-size*1.732 solid @triangle-color;
}
.piece-graph-2 {
  @triangle-suqare: 100px;
  display: block;
  width: @triangle-suqare;
  height: @triangle-suqare;
  background-color: #000;
}
.piece-graph-3 {
  @triangle-round: 130px;
  display: block;
  width: @triangle-round;
  height: @triangle-round;
  background-color: #000;
  border-radius: 50%;
}
.piece-graph-4 {
  @triangle-round-2: 60px;
  display: block;
  width: @triangle-round-2;
  height: @triangle-round-2;
  background-color: #000;
  border-radius: 50%;
}
</style>
