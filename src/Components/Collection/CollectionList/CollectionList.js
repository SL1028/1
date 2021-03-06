import React from 'react';
import './CollectionList.css';
import CollectionCard from './CollectionCard/CollectionCard';
import CollectionListView from './CollectionListView/CollectionListView';

class CollectionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderStyle: localStorage.getItem('renderStyle') || 'card'
    }
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  handleSortChange(e) {
    let sortMethod = e.target.value;
    this.props.updateSort(sortMethod);
  }

  render() {
    return(
      <div className="list-container">
        <div className='list-sort-container'>
          <p className='list-info'>
            <span className='resultCount'>{this.props.cards.length} Results</span>
            <span className='filterCount' onClick={this.props.showMobileFilters}>{this.props.filterCount === 0 ? 'Add Filters (0)' : 'Edit Filters (' + this.props.filterCount +')'}</span>
          </p>
          <span className='list-sort-input'>
            <span className='list-display'>
              <i onClick={()=>{
                localStorage.setItem('renderStyle', 'card');
                this.setState({renderStyle: 'card'});
              }} className={'fas fa-th-large' + (this.state.renderStyle === 'card' ? ' active' : '')}></i>
              <i onClick={()=>{
                localStorage.setItem('renderStyle', 'list');
                this.setState({renderStyle: 'list'});
              }} className={'fas fa-list' + (this.state.renderStyle === 'list' ? ' active' : '')}></i>
            </span>
            <span className='list-sort-dropdown'>
              Sort by: 
              <select onChange={this.handleSortChange} defaultValue='splinter'>
                <option value='splinter'>Splinter</option>
                <option value='az'>Name: A - Z</option>
                <option value='za'>Name: Z - A</option>
                <option value='manaAsc'>Mana: Low - High</option>
                <option value='manaDes'>Mana: High - Low</option>
              </select>
            </span>
          </span>
        </div>
      	<div className='list'>
          {this.state.renderStyle === 'list' ?
          <div className='collection list-item header'>
            <p className='center'></p>
            <p>Name</p>
            <p className='center'>Quantity</p>
          </div> : '' }
	         {this.props.loading ?
            <div className='loader-container'><div className='loader'></div></div> :
            this.props.cards.length === 0 ?
              <p className='noCards'>No cards were found. Please update the filters.</p> : 
              this.props.cards.map(card => {
                if (this.state.renderStyle === 'list') {
                  return (<CollectionListView info={card} />);
                } else if (this.state.renderStyle === 'card') {
                  return (<CollectionCard info={card} />);
                }
              })
           }
	      </div>
      </div>
    );
  }
}

export default CollectionList;