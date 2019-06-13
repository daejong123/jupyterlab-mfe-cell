import * as React from 'react';
import { Radio, message, Input, Button, Modal } from 'antd';
import '../../style/index.css';
const { TextArea } = Input;
const confirm = Modal.confirm;

export enum ChoiceType {
  choice = 123,
  judge
}

enum AddDirection {
  up,
  down
}
export interface MfeObj {
  type: ChoiceType;
  title: string;
  option: string[];
  answer: string;
  explain: string;
  [key: string]: any;
}

interface IProps extends MfeObj {
  deleteChoiceItem: (title: string, index: number) => void;
  onChangeContent: (title: string, mfeObj: MfeObj, index: number) => void;
  canEdit?: boolean;
  index: number;
}

class ChoiceComponent extends React.Component<IProps, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      userSelectAnswer: ''
    };
    this.onSelect = this.onSelect.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onOptionChange = this.onOptionChange.bind(this);
    this.onAnswerSetChange = this.onAnswerSetChange.bind(this);
    this.onExplainChange = this.onExplainChange.bind(this);
    this.deleteItemChoice = this.deleteItemChoice.bind(this);
    this.onDeleteChoiceOption = this.onDeleteChoiceOption.bind(this);
    this.onAddChoiceOption = this.onAddChoiceOption.bind(this);
  }

  // 根据索引获取选择题的选项名
  private getChoiceNameByIndex(index: number, type: ChoiceType): string {
    if (type === ChoiceType.choice) {
      return String.fromCharCode(65 + index);
    } else if (type === ChoiceType.judge) {
      return index === 0 ? '对' : '错';
    }
  }

  // 用户答案选择
  private onSelect(e: any) {
    const { answer } = this.props;
    const isCorrect = answer.trim() === e.target.value.trim();
    message.success(
      `你选择了${e.target.value}, ${isCorrect ? '正确' : '错误'}`
    );
    this.setState({
      userSelectAnswer: e.target.value
    });
  }

  // 存储数据到notebook中，并且刷新组件ui
  private handleMfeObj(key: string, value: any) {
    if (!this.props.hasOwnProperty(key)) return;
    const { index, title, option, answer, type, explain } = this.props;
    let mfeObj: MfeObj = { type, title, option, answer, explain };
    mfeObj[key] = value;
    this.props.onChangeContent &&
      this.props.onChangeContent(title, mfeObj, index);
  }

  // 题目的title发生改变
  private onTitleChange(e: any) {
    const newTitle = e.target.value || '';
    this.handleMfeObj('title', newTitle.replace(/'/g, '"'));
  }

  // 题目的选择内容发送改变
  private onOptionChange(e: any, optionName: string) {
    const optionContent = e.target.value || '';
    const { option, type } = this.props;
    let newOption = [...option];
    const targetOptionIndex = newOption.findIndex((item, index) => {
      return this.getChoiceNameByIndex(index, type) === optionName;
    });
    if (targetOptionIndex !== -1) {
      newOption[targetOptionIndex] = optionContent.replace(/'/g, '"');
      this.handleMfeObj('option', newOption);
    }
  }

  // 当前题目的答案发生改变
  private onAnswerSetChange(e: any) {
    const rightAnswer = e.target.value.trim();
    this.handleMfeObj('answer', rightAnswer);
  }

  // 当前题目的解析发生变
  private onExplainChange(e: any) {
    this.handleMfeObj('explain', e.target.value.replace(/'/g, '"'));
  }

  // 删除整个题目
  private deleteItemChoice(e: any) {
    const that = this;
    confirm({
      title: '提示',
      content: '确定要删除该题吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk() {
        const { title, index } = that.props;
        that.props.deleteChoiceItem(title, index);
      }
    });
  }

  // 删除题目的选择项
  private onDeleteChoiceOption(e: any, index: number) {
    let newOption = [...this.props.option];
    newOption.splice(index, 1);
    this.handleMfeObj('option', newOption);
  }

  // 添加题目的选择项
  private onAddChoiceOption(e: any, index: number, direction: AddDirection) {
    let newOption = [...this.props.option];
    if (direction === AddDirection.up) {
      newOption.splice(index, 0, '');
    } else {
      newOption.splice(index + 1, 0, '');
    }
    this.handleMfeObj('option', newOption);
  }

  // 性能优化，当数据没有变化时，避免重新渲染ui
  shouldComponentUpdate(nextProps: IProps, nextState: any) {
    const { title, option, answer, explain, canEdit } = this.props;
    const {
      title: nextTitle,
      option: nextOption,
      answer: nextAnswer,
      explain: nextExplain,
      canEdit: nextCanEdit
    } = nextProps;
    const { userSelectAnswer } = this.state;
    const { userSelectAnswer: nextUserSelectAnswer } = nextState;
    let shouldUpdate = false;
    if (
      title !== nextTitle ||
      answer !== nextAnswer ||
      explain !== nextExplain ||
      canEdit !== nextCanEdit ||
      option.length !== nextOption.length ||
      option.join() !== nextOption.join() ||
      userSelectAnswer !== nextUserSelectAnswer
    ) {
      shouldUpdate = true;
    }
    return shouldUpdate;
  }

  render() {
    const {
      canEdit = false,
      type,
      title,
      option,
      answer,
      explain
    } = this.props;
    const { userSelectAnswer } = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
      marginTop: '5px'
    };
    const marginLeft = {
      marginLeft: '5px'
    };
    return (
      <div className="choice-container">
        {canEdit === true && (
          <Button
            type="danger"
            style={{ margin: '5px 0' }}
            onClick={this.deleteItemChoice}
          >
            删除该题
          </Button>
        )}
        <h2>
          {canEdit === true ? (
            <TextArea
              id="title-input"
              placeholder="请输入题目"
              autosize={{ minRows: 1, maxRows: 3 }}
              defaultValue={title}
              onBlur={this.onTitleChange}
            />
          ) : (
            <span>{title}</span>
          )}
        </h2>
        <div>
          <Radio.Group onChange={this.onSelect} value={userSelectAnswer}>
            {(option as string[]).map((item, index) => {
              const choiceOption = this.getChoiceNameByIndex(index, type);
              const choiceContent = item;
              return (
                <Radio style={radioStyle} value={choiceOption} key={index}>
                  {choiceOption}.
                  {canEdit === true ? (
                    <React.Fragment>
                      <Input
                        defaultValue={choiceContent}
                        onBlur={e => this.onOptionChange(e, choiceOption)}
                      />
                      {type === ChoiceType.choice && (
                        <React.Fragment>
                          {(option as string[]).length > 2 && (
                            <Button
                              size="small"
                              type="danger"
                              style={marginLeft}
                              onClick={e => this.onDeleteChoiceOption(e, index)}
                            >
                              删除
                            </Button>
                          )}
                          <Button
                            size="small"
                            type="primary"
                            style={marginLeft}
                            onClick={e =>
                              this.onAddChoiceOption(e, index, AddDirection.up)
                            }
                          >
                            上面添加
                          </Button>
                          <Button
                            size="small"
                            style={marginLeft}
                            onClick={e =>
                              this.onAddChoiceOption(
                                e,
                                index,
                                AddDirection.down
                              )
                            }
                          >
                            下面添加
                          </Button>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  ) : (
                    <span>{choiceContent}</span>
                  )}
                </Radio>
              );
            })}
          </Radio.Group>
        </div>
        {canEdit === true && (
          <div style={{ margin: '5px 0' }}>
            <label>设置答案：</label>
            <Radio.Group onChange={this.onAnswerSetChange} value={answer}>
              {(option as string[]).map((item, index) => {
                const choiceOption = this.getChoiceNameByIndex(index, type);
                return (
                  <Radio value={choiceOption} key={index}>
                    {choiceOption}
                  </Radio>
                );
              })}
            </Radio.Group>
          </div>
        )}
        <div>
          {canEdit === true && (
            <TextArea
              id="explain-input"
              placeholder="这里可以写题目解析哦！"
              autosize={{ minRows: 2, maxRows: 6 }}
              defaultValue={explain}
              onBlur={this.onExplainChange}
            />
          )}
        </div>
      </div>
    );
  }
}

export default ChoiceComponent;
