import React, { Component } from 'react';
import {Alert} from 'reactstrap';

import {Badge, Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, Label, Row, Table} from 'reactstrap';

class Istoric extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      parkings: [],
      serverTime: 0,
    }

    if(window.LoggedIn != true)
      return this.props.history.push('/login');

    var this_ = this;

    var request = new Request('http://172.31.3.30:8080/myParkings/', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({ userID: window.userID})
    })

    fetch(request)
      .then(function(response){
      response.json()
        .then(function(data) {
          if(data.status == 'success')
            this_.setState({ parkings: data.parkings, serverTime: data.serverTime });

            this_.state.parkings.map((parking, key) => console.log(parking));
        })
    })    
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" lg="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Istoric parcari
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                <thead>
                  <tr>
                    <th><center>Denumire parcare</center></th>
                    <th><center>Loc parcare</center></th>
                    <th><center>Numar inmatriculare</center></th>
                    <th><center>Data expirare</center></th>
                    <th><center>Status</center></th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.parkings.map((parking, key) => <tr><td><center>{parking.name}</center></td><td><center>{parking.park_spot}</center></td><td><center>{parking.vehicle_number}</center></td><td><center>{new Date(parking.expire_time).toISOString().slice(0, 19).replace('T', ' ')}</center></td><td><center>{(parking.expire_time < this.state.serverTime ? <Badge color="danger">Inactiv</Badge> : <Badge color="success">Activ</Badge>)}</center></td></tr>)} 
                </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Istoric;