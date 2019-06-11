import * as React from 'react';
import { Radio, message, Input, Button } from 'antd';
import '../../style/index.css';
const { TextArea } = Input;
export interface MfeObj {
    type: string,
    title: string,
    option: { [key: string]: string }[],
    answer: string,
    explain: string,
    [key: string]: any
}

interface IProps extends MfeObj {
    deleteChoiceItem: (title: string) => void;
    onChangeContent: (title: string, mfeObj: MfeObj) => void,
    canEdit?: boolean,
}

class ChoiceComponent extends React.Component<IProps, any> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            userSelectAnswer: '',
            title: props.title || "",
            option: props.option || [],
            answer: props.answer.split(' ')[0] || "",
            explain: props.explain || ''
        };
        this.onSelect = this.onSelect.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.onOptionChange = this.onOptionChange.bind(this);
        this.onAnswerSetChange = this.onAnswerSetChange.bind(this);
        this.onExplainChange = this.onExplainChange.bind(this);
        this.deleteItemChoice = this.deleteItemChoice.bind(this);
    }

    onSelect(e: any) {
        const { answer } = this.props;
        const isCorrect = answer.trim() === e.target.value.trim();
        message.success(`你选择了${e.target.value}, ${isCorrect ? "正确" : "错误"}`);
        this.setState({
            userSelectAnswer: e.target.value,
        });
    };

    private handleMfeObj(key: string, value: any) {
        if (!this.state.hasOwnProperty(key)) return;
        const { title, option, answer, type, explain } = this.props;
        let mfeObj: MfeObj = { type, title, option, answer, explain };
        mfeObj[key] = value;
        this.props.onChangeContent && this.props.onChangeContent(title, mfeObj);
    }

    onTitleChange(e: any) {
        const newTitle = e.target.value || '';
        this.setState({
            title: newTitle
        });
        this.handleMfeObj('title', newTitle.replace(/'/g, '"'))
    }

    deleteItemChoice(e: any) {
        this.props.deleteChoiceItem(this.state.title);
    }

    onOptionChange(e: any, optionName: string) {
        const optionContent = e.target.value || '';
        const { option } = this.props;
        const targetOptionIndex = option.findIndex(item => Object.keys(item)[0] === optionName);
        if (targetOptionIndex !== -1) {
            option[targetOptionIndex][optionName] = optionContent.replace(/'/g, '"');
        }
        this.setState({
            option: option
        });
        this.handleMfeObj('option', option);
    }

    onAnswerSetChange(e: any) {
        const rightAnswer = e.target.value.trim().replace(/'/g, '"');
        this.setState({
            answer: rightAnswer
        });
        this.handleMfeObj('answer', rightAnswer)
    }

    onExplainChange(e: any) {
        const explainContent = e.target.value || '';
        this.setState({
            explain: explainContent
        });
        this.handleMfeObj('explain', explainContent.replace(/'/g, '"'));
    }

    render() {
        const { canEdit = false } = this.props;
        const { title, option, userSelectAnswer, answer, explain } = this.state;
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            marginTop: '5px'
        };
        return (
            <div className="choice-container">
                {
                    canEdit === true &&
                    (
                        <Button type="danger" style={{margin: "5px 0"}} onClick={this.deleteItemChoice}>删除该题</Button>
                    )
                }
                <h2>
                    {
                        canEdit === true ?
                            (
                                <TextArea
                                    id="title-input"
                                    placeholder="请输入题目"
                                    autosize={{ minRows: 1, maxRows: 3 }}
                                    value={title}
                                    onChange={this.onTitleChange}
                                />
                            )
                            :
                            <span>{title}</span>
                    }
                </h2>
                <div>
                    <Radio.Group onChange={this.onSelect} value={userSelectAnswer}>
                        {
                            (option as { [key: string]: string }[]).map((item, index) => {
                                const choiceOption = Object.keys(item)[0];
                                const choiceContent = `${item[choiceOption]}`;
                                return (
                                    <Radio style={radioStyle} value={choiceOption} key={index}>
                                        {choiceOption}.
                                        {
                                            canEdit === true ?
                                                <Input value={choiceContent} onChange={(e) => this.onOptionChange(e, choiceOption)} />
                                                :
                                                <span>{choiceContent}</span>
                                        }
                                    </Radio>
                                )
                            })
                        }
                    </Radio.Group>
                </div>
                {
                    canEdit === true &&
                    (
                        <div style={{margin: "5px 0"}}>
                            <label>设置答案：</label>
                            <Radio.Group onChange={this.onAnswerSetChange} value={answer}>
                                {
                                    (option as { [key: string]: string }[]).map((item, index) => {
                                        const choiceOption = Object.keys(item)[0];
                                        return (<Radio value={choiceOption} key={index}>{choiceOption}</Radio>);
                                    })
                                }
                            </Radio.Group>
                        </div>
                    )
                }
                <div>
                    {
                        canEdit === true &&
                        (
                            <TextArea
                                id="explain-input"
                                placeholder="这里可以写题目解析哦！"
                                autosize={{ minRows: 2, maxRows: 6 }}
                                value={explain}
                                onChange={this.onExplainChange}
                            />
                        )
                    }
                </div>
            </div>
        )
    }
}

export default ChoiceComponent;