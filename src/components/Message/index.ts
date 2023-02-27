import { createApp, App } from "vue";
import MessageConstructor from "./Message.vue";
import { uuid } from "../utils";

let $inst;

const config = {
  margin: 40,
  zIndex: 10000
}

let qty = 0,
  prevTop = config.margin,
  nodeList = [] as HTMLDivElement[];

const addStyle = (mountNode: HTMLDivElement, index: number) => {
  nodeList.push(mountNode);
  mountNode.setAttribute("no", index.toString());
  mountNode.classList.add(`global_message`);
  mountNode.style.position = "fixed";
  mountNode.style.right = `${config.margin}px`;
  mountNode.style.zIndex = config.zIndex.toString();
  mountNode.style.top = `${prevTop}px`;
};

const setTop = (index: number, mountNode: HTMLDivElement, callback?: Function) => {
  // 触发向上推动
  nodeList.forEach((mountNode, i) => {
    if (i > 0) {
      mountNode.style.top = `${mountNode.offsetTop - nodeList[i - 1].offsetHeight}px`;
    }
  });
  prevTop -= mountNode.offsetHeight
  qty--
  callback && callback();
};

// 创建挂载实例
const createMount = (mountNode: HTMLDivElement, opts: any) => {
  const index = mountNode.getAttribute("no");
  if (!index) return;
  const app = createApp(MessageConstructor, {
    ...opts,
    modelValue: true,
    remove() {
      setTop(parseInt(index), mountNode, () => {
        app.unmount();
        document.body.removeChild(mountNode);
      });
    },
  });
  return app.mount(mountNode);
};

function Message(options: any = {}) {
  options.id = `message_${uuid()}`;

  const mountNode = document.createElement("div");
  addStyle(mountNode, qty++);
  document.body.appendChild(mountNode);

  $inst = createMount(mountNode, options);
  prevTop += mountNode.offsetHeight;

  return $inst;
}

// 暴露 插件 与上面的app无关
Message.install = (globalApp: App) => {
  globalApp.component("message", MessageConstructor);
  globalApp.provide("_message", Message);
};

export default Message;

// How To Use
// ------ app.ts ------ 
// app.use(Message)
// ------ page.vue ------ 
// import { inject } from "vue";
// const message = inject('_message') as Function
// message({
//   type: 'info',
//   value: Math.random().toString()
// })