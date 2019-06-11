import * as React from 'react';
import { Button } from 'antd';
import ChoiceComponent, { MfeObj } from './components/ChoiceComponent';

interface IProps {
  mfeObjs: MfeObj[];
  onChangeContent: (title: string, mfeObj: MfeObj) => void;
  addChoiceItem: (mfeObj: MfeObj) => void;
  deleteChoiceItem: (title: string) => void;
}

class MfeComponent extends React.Component<IProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      canEdit: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.addChoice = this.addChoice.bind(this);
    this.addJudegeChoice = this.addJudegeChoice.bind(this);
  }

  handleClick(e: any) {
    this.setState((state: any, props: any) => {
      let result = true;
      if (state.canEdit === true) {
        result = false;
      }
      return {
        canEdit: result
      };
    });
  }

  addChoice(e: any) {
    let mfeObj: MfeObj = {
      type: 'choice',
      option: [{ A: '' }, { B: '' }, { C: '' }, { D: '' }],
      title: '',
      explain: '',
      answer: 'A'
    };
    this.props.addChoiceItem(mfeObj);
  }

  addJudegeChoice(e: any) {
    let mfeObj: MfeObj = {
      type: 'judge',
      option: [{ 对: '' }, { 错: '' }],
      title: '',
      explain: '',
      answer: '对'
    };
    this.props.addChoiceItem(mfeObj);
  }

  render() {
    const { canEdit } = this.state;
    const { mfeObjs, onChangeContent, deleteChoiceItem } = this.props;
    console.log('重新获取到json内容并渲染：', mfeObjs);
    return (
      <div>
        <h2>选择题</h2>
        <Button onClick={this.handleClick}>
          {canEdit === true ? '预览' : '编辑'}
        </Button>
        {canEdit === true && (
          <React.Fragment>
            <Button
              type="primary"
              style={{ margin: '0 5px' }}
              onClick={this.addChoice}
            >
              添加选择题
            </Button>
            <Button onClick={this.addJudegeChoice}>添加判断题</Button>
          </React.Fragment>
        )}
        {mfeObjs.map((item: MfeObj, index: number) => {
          if (item && ['choice', 'judge'].find(type => type === item.type)) {
            return (
              <ChoiceComponent
                {...item}
                deleteChoiceItem={deleteChoiceItem}
                onChangeContent={onChangeContent}
                canEdit={canEdit}
                key={item.answer + index}
              />
            );
          }
        })}
      </div>
    );
  }
}

export default MfeComponent;
