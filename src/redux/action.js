import io from 'socket.io-client'
import {
  AUTH_SUCCESS,
  ERROR_MSG,
  RECEIVE_USER,
  RESET_USER,
  RECEIVE_MSG_LIST,
  RECEIVE_MSG,
  MSG_READ,
  RECEIVE_PATH,
  RECEIVE_USER_UPDATE,
  RECEIVE_FOOD,
  REFUSE_FOOD,
  RECEIVE_ARTIVLE_LIST,
  RESET_SEND_REDIRECT,
  CHANGE_STATUS
} from './action-type'
import {
  reqLogin,
  reqRegister,
  reqUpdate,
  reqUser,
  reqMsgList,
  reqReadMsg,
  reqUpdatePassword,
  reqSendArticle,
  reqArticleList,
  reqChangeStatus
} from '../api'
// 同步错误消息
const errorMsg = msg => ({type: ERROR_MSG, data: msg});
// 同步成功响应
const authSuccess = user => ({type: AUTH_SUCCESS, data: user});
// 同步更新用户的信息
const receiveUser = user => ({type: RECEIVE_USER, data: user});
// 同步重置用户信息
export const resetUser = msg => ({type: RESET_USER, data: msg});
//同步当前路径
export const receiveCurrentPath = currentPath => ({type: RECEIVE_PATH, data: currentPath});
// 同步获取消息列表
const receiveMsgList = ({users, chatMsgs, userid}) => ({type: RECEIVE_MSG_LIST, data: {users, chatMsgs, userid}});
// 同步接受到消息
const receiveMsg = ({chatMsg, userid}) => ({type: RECEIVE_MSG, data: {chatMsg, userid}});
// 同步阅读消息
const msgRead = ({count, from, to}) => ({type: MSG_READ, data: {count, from, to}});
// 同步更新失物信息
const receiveFood = (data) => ({type: RECEIVE_FOOD, data});
// 同步发布失败的消息
const refuseFood = msg => ({type: REFUSE_FOOD, data: {msg}});
// 同步获取所有的失物信息
const receiveArticleList = (data) => ({type: RECEIVE_ARTIVLE_LIST, data});
// 重置发布消息的重定向
export const resetSendRedirect = () => ({type: RESET_SEND_REDIRECT});
// 同步更新状态
const changeStatusSucess = ({_lostId, status}) => ({type: CHANGE_STATUS, data: {_lostId, status}})
function initIo(dispatch, userid) {
  if (!io.socket) {
    io.socket = io('ws://localhost:4000');
    io.socket.on('receiveMsg', function (chatMsg) {
      console.log('客户端收到服务器端发送来的消息', chatMsg);
      if (userid === chatMsg.from || userid === chatMsg.to) {
        dispatch(receiveMsg({chatMsg, userid}))
      }
    })
  }
}
/*得到所有的聊天消息*/
async function getMsgList(dispatch, userid) {
  initIo(dispatch, userid);
  const response = await reqMsgList();
  const result = response.data;
  if (result.code === 0) {
    const {users, chatMsgs} = result.data;
    dispatch(receiveMsgList({users, chatMsgs, userid}))
  }
}
/*获取所有的失物信息*/
async function getArticleList (dispatch) {
  const response = await reqArticleList();
  const result = response.data;
  if (result.code === 0) {
    dispatch(receiveArticleList(result.data))
  } else {
    dispatch(refuseFood(result.msg))
  }
}
export const getArticle = () => {
  return dispatch => {
    getArticleList(dispatch);
  }
}
/*
阅读消息
*/
export const readMsg = ({from, to}) => {
  return async dispatch => {
    const response = await reqReadMsg(from);
    const result = response.data;
    if (result.code === 0) {
      const count = result.data;
      dispatch(msgRead({count, from, to}))
    }
  }
};
/*
发送消息
*/
export const sendMsg = ({from, to, content}) => {
  return dispatch => {
    io.socket.emit('sendMsg', {from, to, content});
    console.log('客户端向服务器发送消息', {from, to, content})
  }
};
/*
异步注册
*/
export function register({username, password, password2}) {
  if (!username || !password) {
    return errorMsg('用户名密码必须输入')
  }
  if (password !== password2) {
    return errorMsg('密码和确认密码不同')
  }
  return async dispatch => {
    const response = await reqRegister({username,password});
    const result = response.data;
    if (result.code === 0) {
      getMsgList(dispatch, result.data._id);
      getArticleList(dispatch);
      dispatch(authSuccess(result.data))
    } else {
      dispatch(errorMsg(result.msg))
    }
  }
}
/*
异步登录
*/
export const login = ({username, password}) => {
  if (!username || !password) {
    return errorMsg('用户名密码必须输入')
  }
  return async dispatch => {
    const response = await reqLogin({username, password});
    const result = response.data;
    if (result.code === 0) {
      getMsgList(dispatch, result.data._id);
      getArticleList(dispatch);
      dispatch(authSuccess(result.data))
    } else {
      dispatch(errorMsg(result.msg))
    }
  }
};
/*修改密码*/
export const updatePassword = ({password, oldPassword}) => {
  return async dispatch => {
    const response = await reqUpdatePassword({oldPassword, password});
    const result = response.data;
    if (result.code === 0) {
      dispatch({type: RECEIVE_USER_UPDATE});
      return true;
    } else {
      dispatch(errorMsg(result.msg));
      return false;
    }
  }
};

/*
异步更新用户信息
*/
export const updateUser = user => {
  return async dispatch => {
    const response = await reqUpdate(user);
    const result = response.data;
    if (result.code === 0) {
      dispatch(receiveUser(result.data))
    } else {
      dispatch(resetUser(result.msg))
    }
  }
};

/*
异步得到用户信息
*/
export const getUser = () => {
  return async dispatch => {
    const response = await reqUser();
    const result = response.data;
    if (result.code === 0) {
      getMsgList(dispatch, result.data._id);
      getArticleList(dispatch);
      dispatch(receiveUser(result.data))
    } else {
      dispatch(resetUser(result.data))
    }
  }
};
/*异步发布失物信息*/
export const sendFood = ({lName, address, contact, desc, images}) => {
  return async dispatch => {
    const response = await reqSendArticle({lName, address, contact, desc, images});
    const result = response.data;
    if (result.code === 0) {
      dispatch(receiveFood(result.data))
    } else {
      dispatch(refuseFood(result.msg))
    }
  }
};
/*异步修改消息的状态*/
export const changeStatus = ({_lostId, status}) => {
  return async dispatch => {
    const response = await reqChangeStatus({_lostId, status});
    const result = response.data;
    if (result.code === 0) {
      dispatch(changeStatusSucess({_lostId, status}))
    } else {
      dispatch(refuseFood(result.msg))
    }
  }
}


