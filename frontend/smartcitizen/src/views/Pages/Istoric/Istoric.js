import React, { Component } from 'react';
import {Alert} from 'reactstrap';

import {Badge, Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, Label, Row, Table, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';

var globalThis = null;

class Istoric extends Component {

  constructor(props) {
    super(props);

    this.state = {
      parkings: [],
      serverTime: 0,
      showModal: false,
      modalType: '',
      extend_time: 0,
    }

    globalThis = this;

    if(sessionStorage.getItem('loggedIn') !== 'true')
      return this.props.history.push('/login');

    this.loadData();
  }

  loadData() {
    var request = new Request(process.env.REACT_APP_BACKEND_ADDRESS+'/myParkings/', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({ userID: sessionStorage.getItem('userID')})
    })

    fetch(request)
      .then(function(response){
      response.json()
        .then(function(data) {
          if(data.status == 'success')
            globalThis.setState({ parkings: data.parkings, serverTime: data.serverTime });
        })
    })    
  }

  Extend(e, id) {
    e.preventDefault();
    this.setState({modalType: 'extend', spotID: id});
    this.toggleModal();
  }

  Delete(e, id) {
    e.preventDefault();
    this.setState({modalType: 'delete', spotID: id});
    this.toggleModal();
  }

  onDelete(e) {
    e.preventDefault();
    globalThis.toggleModal();

    var request = new Request(process.env.REACT_APP_BACKEND_ADDRESS+'/deleteParking/', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({ userID: sessionStorage.getItem('userID'), spotID: this.state.spotID})
    });

    fetch(request)
      .then(function(response) {
      response.json()
        .then(function(data) {
          if(data.status == 'success') {
            globalThis.loadData();
          }
        })
      })    
  }

  onExtend(e) {
    e.preventDefault();
    globalThis.toggleModal();

    var request = new Request(process.env.REACT_APP_BACKEND_ADDRESS+'/extendRent/', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({ userID: sessionStorage.getItem('userID'), rentId: this.state.spotID, Time: this.state.extend_time})
    });

    fetch(request)
      .then(function(response) {
      response.json()
        .then(function(data) {
          if(data.status == 'success') {
            globalThis.loadData();
          }
        })
      })    
  }

  toggleModal() {
    globalThis.setState({modal: !globalThis.state.modal});
  }

  change(e) {
    this.setState({[e.target.name] : e.target.value.toUpperCase()});
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Modal isOpen={this.state.modal} toggle = {this.toggleModal} className={'modal-lg'}>
          <ModalHeader toggle={this.toggleModal}> { globalThis.state.modalType === 'extend' ? 'Extindere perioada parcare' : 'Eliberare loc parcare' }</ModalHeader>
            <ModalBody>
              { globalThis.state.modalType === 'delete' ? 
                  <div>
                    Daca ti-ai eliberat locul de parcare mai devreme de termenul afisat pe site poti elibera locul de parcare.
                    <br></br>
                    <center><Button className={'btn-warning'} onClick={e=>globalThis.onDelete(e)}><i className={'fa fa-trash-o'}></i> Elibereaza loc parcare</Button></center>
                  </div>
              : null }

              { globalThis.state.modalType === 'extend' ? 
                  <div>
                    Alege perioada de timp cu care doresti sa extinzi locul de parcare.
                    <br></br>
                    <br></br>
                    <br></br>
                    <Form encType="multipart/form-data" className="form-horizontal">
                      <FormGroup row>
                          <Col md="3">
                            <Label htmlFor="extend_time">Perioada prelungire</Label>
                          </Col>
                          <Col xs="12" md="9">
                            <Input type="select" name="extend_time" id="extend_time" bsSize="sm" ref = "extend_time" value={ this.state.extend_time } onChange={e => globalThis.change(e)}>
                              <option value="0">Please select</option>
                              <option value="30">30 de minute</option>
                              <option value="60">1 ora</option>
                              <option value="180">3 ore</option>
                              <option value="360">6 ore</option>
                              <option value="1440">24 ore</option>
                            </Input>
                          </Col>
                        </FormGroup>
                    </Form>
                    <br></br>
                    <center><Button className={'btn-success'} onClick={e=>globalThis.onExtend(e)}><i className={'fa fa-plus-square'}></i> Extinde loc parcare</Button></center>
                  </div>
              : null }
            </ModalBody>
        </Modal> 
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
                  {this.state.parkings.map((parking, key) => <tr><td><center>{parking.name} {parking.expire_time > this.state.serverTime ? <span><a onClick = {e => this.Extend(e, parking.id)}><i className = {'fa fa-plus-square'} style = {{color: 'green'}}></i></a> <a onClick = {e => this.Delete(e, parking.id)}><i className = {'fa fa-trash-o'} style = {{color: 'red'}}></i></a></span> : null } </center></td><td><center>{parking.park_spot}</center></td><td><center>{parking.vehicle_number}</center></td><td><center>{new Date(parking.expire_time).toISOString().slice(0, 19).replace('T', ' ')}</center></td><td><center>{(parking.expire_time < this.state.serverTime ? <Badge color="danger">Inactiv</Badge> : <Badge color="success">Activ</Badge>)}</center></td></tr>)} 
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