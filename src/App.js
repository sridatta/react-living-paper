import React, { Component } from 'react';
import {Editor, EditorState, CompositeDecorator, SelectionState, Modifier, Entity} from 'draft-js'
import logo from './logo.svg';
import './App.css';

const compositeDecorator = new CompositeDecorator([
  {
    strategy: (block, callback) => {
      block.findEntityRanges(c => {
        return c.getEntity() && Entity.get(c.getEntity()).type === 'MAGIC'
      }, callback)
    },
    component: (props) => {
      return <strong contentEditable='false'>{props.children}</strong>
    }
  }
])

class MyEditor extends React.Component {
  state = {
    editorState: EditorState.createEmpty(compositeDecorator)
  }

  handleBeforeInput = (char) => {
    let {editorState} = this.state
    let contentState = editorState.getCurrentContent()
    // Find the magic word in each block
    for (let [blockKey, block] of contentState.getBlockMap().entries()) {
      const text = block.getText()
      if (text.indexOf('sridatta') !== -1) {
        const idx = text.indexOf('sridatta')
        const selection = SelectionState.createEmpty(blockKey).merge(
          {anchorOffset: idx, focusOffset: idx + 8})
        let entityKey = Entity.create(
          'MAGIC',
          'IMMUTABLE',
          {'text': 'sridatta'})
        contentState = Modifier.applyEntity(
          contentState,
          selection,
          entityKey
        )
        console.log(
          contentState.getSelectionBefore().serialize(),
          contentState.getSelectionAfter().serialize())
        this.onChange(EditorState.push(editorState, contentState, 'apply-entity'))
        return 'handled'
      }
    }
    return 'not-handled'
  }

  onChange = (editorState) => {
    this.setState({editorState})
  }

  render() {
    return <div className="App-editor">
      <Editor
        editorState={this.state.editorState}
        onChange={this.onChange}
        handleBeforeInput={this.handleBeforeInput}/>
    </div>
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Living Paper</h2>
        </div>
        <MyEditor />
      </div>
    );
  }
}

export default App;
