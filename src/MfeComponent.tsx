import * as React from 'react';
import { Button } from 'antd';
import ChoiceComponent, {
  MfeObj,
  ChoiceType
} from './components/ChoiceComponent';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import '../style/index.css';

interface IProps {
  mfeObjs: MfeObj[];
  onChangeContent: (title: string, mfeObj: MfeObj, index: number) => void;
  addChoiceItem: (mfeObj: MfeObj) => void;
  deleteChoiceItem: (title: string, index: number) => void;
}

class MfeComponent extends React.Component<IProps, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      canEdit: false
    };
    this.handleEditClick = this.handleEditClick.bind(this);
    this.addChoice = this.addChoice.bind(this);
    this.addJudegeChoice = this.addJudegeChoice.bind(this);
  }

  handleEditClick(e: any) {
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

  // 添加选择题
  addChoice(e: any) {
    let mfeObj: MfeObj = {
      type: ChoiceType.choice,
      option: ['', '', '', ''],
      title: '',
      explain: '',
      answer: 'A'
    };
    this.props.addChoiceItem(mfeObj);
  }

  // 添加判断题
  addJudegeChoice(e: any) {
    let mfeObj: MfeObj = {
      type: ChoiceType.judge,
      option: ['', ''],
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
        <h1 className="vertical-horizon-center-container">选择题</h1>
        <TransitionGroup>
          {mfeObjs
            .filter(item => item)
            .map((item: MfeObj, index: number) => (
              <CSSTransition
                classNames="fade"
                timeout={500}
                appear={true}
                unmountOnExit
                key={index}
              >
                <ChoiceComponent
                  {...item}
                  deleteChoiceItem={deleteChoiceItem}
                  onChangeContent={onChangeContent}
                  canEdit={canEdit}
                  index={index}
                />
              </CSSTransition>
            ))}
        </TransitionGroup>
        <div
          className="vertical-horizon-center-container"
          style={{ marginTop: '50px' }}
        >
          <Button onClick={this.handleEditClick}>
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
        </div>
      </div>
    );
  }
}

export default MfeComponent;
