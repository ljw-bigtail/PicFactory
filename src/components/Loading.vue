<template>
  <div class="global-loading">
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
    <div class="global-loading-dot"></div>
  </div>
</template>
<style lang="less" scoped>
@loadsize: 40px;
@keyframes global-loading {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
.global-loading {
  margin: 0 auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  width: @loadsize;
  height: @loadsize;
  &-dot {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    &:before {
      content: "";
      display: block;
      width: 15%;
      height: 15%;
      background-color: var(--color-B);
      border-radius: 100%;
      animation: global-loading 1.2s infinite ease-in-out both;
    }
    &:nth-child(1) {
      transform: rotate(30deg);
    }
    &:nth-child(2) {
      transform: rotate(60deg);
    }
    &:nth-child(3) {
      transform: rotate(90deg);
    }
    &:nth-child(4) {
      transform: rotate(120deg);
    }
    &:nth-child(5) {
      transform: rotate(150deg);
    }
    &:nth-child(6) {
      transform: rotate(180deg);
    }
    &:nth-child(7) {
      transform: rotate(210deg);
    }
    &:nth-child(8) {
      transform: rotate(240deg);
    }
    &:nth-child(9) {
      transform: rotate(270deg);
    }
    &:nth-child(10) {
      transform: rotate(300deg);
    }
    &:nth-child(11) {
      transform: rotate(330deg);
    }
    &:nth-child(1):before {
      animation-delay: -1.1s;
    }
    &:nth-child(2):before {
      animation-delay: -1s;
    }
    &:nth-child(3):before {
      animation-delay: -0.9s;
    }
    &:nth-child(4):before {
      animation-delay: -0.8s;
    }
    &:nth-child(5):before {
      animation-delay: -0.7s;
    }
    &:nth-child(6):before {
      animation-delay: -0.6s;
    }
    &:nth-child(7):before {
      animation-delay: -0.5s;
    }
    &:nth-child(8):before {
      animation-delay: -0.4s;
    }
    &:nth-child(9):before {
      animation-delay: -0.3s;
    }
    &:nth-child(10):before {
      animation-delay: -0.2s;
    }
    &:nth-child(11):before {
      animation-delay: -0.1s;
    }
  }
}
</style>
