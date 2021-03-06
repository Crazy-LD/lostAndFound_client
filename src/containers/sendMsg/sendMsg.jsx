import React from 'react'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {sendFood, resetSendRedirect} from '../../redux/action'

import {
  Icon,
  NavBar,
  WingBlank,
  ImagePicker,
  WhiteSpace,
  InputItem,
  TextareaItem,
  Button,
  Toast,
  Radio
} from 'antd-mobile'
const RadioItem = Radio.RadioItem;
class SendMsg extends React.Component{
  state = {
    files: [],
    lName: '', // 失物名称
    address: '', // 失物地址
    contact: '', // 联系方式
    desc: '', // 其他描述
    isLost: false // 是否东西丢失
  };
  componentWillUnmount() {
    this.props.resetSendRedirect();
  }

  render () {
    const {files, isLost} = this.state;
    const {msg, redirect} = this.props.lostFood;
    const data = [
      { isLost: false, label: '失主快快来认领' },
      { isLost: true, label: '大家帮忙找一找' },
    ];
    if (msg) {
      Toast.fail(msg);
    }
    if (redirect) {
      return <Redirect to={redirect}/>
    }
    return (
      <div  style={{marginTop: 50, marginBottom: 60}}>
        <NavBar className='sticky-header'
                leftContent={<Icon type='left'/>}
                onLeftClick={this.leftClick}>
          Lost & Found
        </NavBar>
        <WingBlank>
          <WhiteSpace/>
          <h3>请选择上传图片：</h3>
          <ImagePicker
            files={files}
            length={3}
            onChange={this.onChange}
            selectable={files.length < 9}
            multiple={true}
          />
          <WhiteSpace/>
          <h3>请选择失物类型：</h3>
          {data.map(i => (
            <RadioItem key={i.isLost} checked={isLost === i.isLost} onChange={() => this.setState({isLost: i.isLost})}>
              {i.label}
            </RadioItem>
          ))}
          <WhiteSpace/>
          <InputItem type='text'
                     placeholder='请输入失物名称'
                     maxLength={15}
                     onChange={val => this.handleChange('lName', val)}><span style={{color: 'red', marginRight: '3px'}}>*</span>失物名称:</InputItem>
          <WhiteSpace/>
          <InputItem type='text'
                     placeholder='请输入失物地址'
                     maxLength={15}
                     onChange={val => this.handleChange('address', val)}><span style={{color: 'red', marginRight: '3px'}}>*</span>失物地址:</InputItem>
          <WhiteSpace/>
          <InputItem type='text'
                     placeholder='请输入联系方式'
                     maxLength={15}
                     onChange={val => this.handleChange('contact', val)}>联系方式:</InputItem>
          <WhiteSpace/>

          <TextareaItem
            title="其他描述："
            autoHeight
            labelNumber={5}
            onChange={val => this.handleChange('desc', val)}
            placeholder='请输入其他描述'
          />
          <WhiteSpace/>
          <Button type='primary' onClick={this.submit}>发布</Button>
        </WingBlank>
      </div>
    )
  }
  leftClick = () => {
    this.props.history.goBack();
  };

  onChange = (files, type, index) => {
    this.setState({
      files,
    });
  };
  handleChange(name, val) {
    this.setState({
      [name]: val
    })
  }

  submit = () => {
    const {lName, address, contact, desc, files, isLost} = this.state;
    if (!lName || !address) {
      Toast.offline('名称和地址必填!!!', 1);
    } else {
      const images = [];
      if (typeof files === 'object') {
        files.map(item => images.push(item.file));
      }
      this.props.sendFood({lName, address, contact, desc, images, isLost});
    }
  }
}
export default connect(
  state => ({lostFood: state.lostFood}),
  {sendFood, resetSendRedirect}
)(SendMsg);