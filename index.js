import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



class DataCell extends React.PureComponent
{

  render()
  {
    return this.props.cellvalue;
  }
}

class DataRow extends React.PureComponent
{
  render()
  {
  let datacells = Object.values(this.props.rowvalue).map((value) => {return <td key ={value}>{<DataCell cellvalue = {value}/>}</td>})
    return datacells;
  }
}

class DataTableHeader extends React.PureComponent
{
  render()
  {
    let keys = Object.keys(this.props.rowvalue);
    let header= keys.map((value) =>{ let valuedecode = value.replace('_',' ')
      return <th key = {value}><button onClick = {()=> this.props.onClick(value)}>{valuedecode} </button></th>});
    return header;
  }
}

class DataTable extends React.PureComponent
{

  getData(readyState, status, responseText)
  { 
    if (readyState === 4 && status === 200) {
      let JsonArray = JSON.parse(responseText);
      let sorttable = {};
      Object.keys(JsonArray[0]).forEach(element => {
        sorttable[element]='N';
      });
      this.setState({
        jsondatatable : JsonArray,
        sort : sorttable,
      });
      if (!(this.state.filter === ''))
      {
        //this is calling set state twice. probably not great but would take a while
        //to rework the logic to avoid the second call.
        this.applyfilter(this.state.filter);    
    }
    }
  }

  constructor(props)
  {
    super(props);

 
    this.getinputdata();

    this.state = {jsondatatable : [],
      sort : {},
      filter : ''}

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    if (event.target.value ==='')
    {
      this.setState({filter: event.target.value});
      this.getinputdata();
    }
    else{
    this.setState({filter: event.target.value});
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.getinputdata();

  }

  getinputdata()
  {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = ((readystate,status,responseText) =>this.getData(xmlhttp.readyState,xmlhttp.status,xmlhttp.responseText));
    xmlhttp.open("GET", "https://wageup-static.s3.amazonaws.com/MOCK_DATA.json", true);
    xmlhttp.send();
  }

  applyfilter(filter)
  {
//  search only some columns (column name) = (value)

    //regex might be overkill for this  
    let recolumn = new RegExp('=','i')
    let matchfiltertable =[];
    if (recolumn.test(filter))
    {
       let spliter= filter.split('=');
       let searchcolumn = spliter[0].trim();
       let searchvalue = spliter[1].trim();
     
      
       let re = new RegExp(searchvalue + '+', 'i' )
       let filtertable =this.state.jsondatatable.slice();
      
       filtertable.forEach(element => {
        if (re.test(element[searchcolumn.replace(' ','_')] ))
        {
          matchfiltertable.push(element);
        }
      });
    }
    else
    {
    // using regex for preformance purposes but if users are knowledgeable this it's a 
    //bonus for them as well. guessing most users won't be that savy though. 
    let re = new RegExp(filter + '+', 'i' )
    let filtertable =this.state.jsondatatable.slice();
      
    filtertable.forEach(element => {
      let match = false;
      Object.keys(element).forEach(searchelement =>{
         if (!match && re.test(element[searchelement] ))
         {
            matchfiltertable.push(element);
            match=true;
         }
      })
    });
  }
    this.setState({jsondatatable : matchfiltertable});
  }

  render()
  {
    if (this.state.jsondatatable.length>0)
    {
    let data=this.state.jsondatatable.map((value,row)=> {
      //using row for data independence. not ideal but without 
      //being able to garentee the name of a key   column in the data, i'm not sure of a better
      //option
      // could create some type of hash function based on all the row's data
      // that would cover most situations except for duplicate rows which i can't currently 
      // garentee won't occur in the data set.


      // i would like to format the date nicer for the user as well but without knowing
      // what columns will be dates. i could look for date in the column name but that 
      // seems like a poor standard agian.
      
      
    return (<tr className ="table-row" key = {row}>{<DataRow rownumber={row} rowvalue = {value}/>}</tr>);});

   return (<div>
            <form onSubmit = {this.handleSubmit}>
              Filter: <br/>
              <input type ="text" value={this.state.filter } onChange={this.handleChange }></input> <br/>
              Filter options:<br/> 
              <li>To search only one column use the following syntax (column name) = (search value) </li>
              <li>To search all columns just enter a serach value.</li>
            </form>
            <table>
              <tbody>
              <tr>{<DataTableHeader rowvalue= {this.state.jsondatatable[0]} 
                                    onClick= {(column) => this.handleClick(column)}
                                    sorttable = {this.state.sort}/>}</tr>
              {data}
              </tbody>
            </table></div>)
    }
    else if (!(this.state.filter ===''))
    {
      return (<div>
      <form onSubmit = {this.handleSubmit}>
        <input type ="text" value={this.state.filter } onChange={this.handleChange }></input>
      </form><h1>No matching data</h1> </div>);
    }
    else
    {
      return <h1> Waiting for data to load </h1>;
        }
  }

  handleClick(column)
  { 
    // doing shallow copy of both state properties. this should be acceptable for now.
    // not sure what the preformance impact would be of doing a deep copy
      let sortarray = this.state.jsondatatable.slice();
      let sorttable = Object.assign(this.state.sort);
      /* 
      doesn't handle dates well but i'm not sure how to 
      detect that a value is a date unless it comes from the requirements 
      - could try parsing the date and if it comes back as invalid date 
        but there could be data meets is a valid date but isn't meant to be a date
      - could look for date in the column name but that seems like a poor assumption
        as well
      */


      //could add a cntl +click for sorting multiple columns
      // would need to change sort table value to a number positive sort assending 
      //and negetive sort desending. each cntl+click would increase absolute value of the 
      // sort number.
     if (sorttable[column]==='N')  
     {
      sortarray.sort(function(a,b){let x =a[column];
        let y =b[column];
        if (isNaN(x)) x = x.toLowerCase();
        if (isNaN(y)) y = y.toLowerCase(); 
        if (x <y ) return -1
        if (x >y) return 1
        return 0;})
        sorttable[column] = 'A'
     }
     else if (sorttable[column]==='A')
     {
      sortarray.sort(function(a,b){let x =a[column];
        let y =b[column];
        if (isNaN(x)) x = x.toLowerCase();
        if (isNaN(y)) y = y.toLowerCase(); 
        if (x <y ) return 1
        if (x >y) return -1
        return 0;})
        sorttable[column] = 'D'
     }
     else
     {
      sorttable[column] = 'N'
     }


     this.setState({jsondatatable : sortarray,
                    sort : sorttable
    });
  }
}
  // ========================================
  
  ReactDOM.render(<DataTable />, document.getElementById("root"));
  
