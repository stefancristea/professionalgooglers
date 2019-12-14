import React, { Component } from 'react';
import {Alert} from 'reactstrap';

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Fade,
  Form,
  FormGroup,
  FormText,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButtonDropdown,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
class Rezerva extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      parkingLotInfo: {},
      vehicle_number: "",
      spot: 0,
      time: 0,
      renderSuccessMessage: false,
    }

    if(window.LoggedIn != true)
      return this.props.history.push('/login');

    this.getData();    
  }

  getData() {
    var request = new Request('http://172.31.3.30:8080/getParkingLotInformation/'+this.props.match.params.id, {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    var _this = this;

    fetch(request)
    .then(function(response){
    response.json()
      .then(function(data) {
        if(data.type == 'success')
          _this.setState({
            parkingLotInfo: data.data
          });
      })
    })
  }

  listAvailableSpots() {
    if(this.state.parkingLotInfo.length == 0)
      return;

    if(this.state.parkingLotInfo.Spots == undefined)
      return;

    var htmlCode = '<option value = "0">Please select</option>';

    for(let i = 1; i < this.state.parkingLotInfo.Spots.length; i++)
      if(!this.state.parkingLotInfo.Spots[i].occupied)
        htmlCode += `<option value="${i}">${i}</option>`;
    return htmlCode;
  }

  listOccupiedSpots() {
    if(this.state.parkingLotInfo.length == 0)
      return;

    if(this.state.parkingLotInfo.Spots == undefined)
      return;

    var htmlCode = '';

    for(let i = 1; i < this.state.parkingLotInfo.Spots.length; i++)
      if(this.state.parkingLotInfo.Spots[i].occupied)
        htmlCode += `<li>loc ${i}: <b>${this.state.parkingLotInfo.Spots[i].vehicle_number}</b></option>`;
    return htmlCode;
  }

  submitForm(e) {
    e.preventDefault();
    
    let data = {
      vehicleNumber: this.state.vehicle_number,
      Time: this.state.time,
      parkLot: this.props.match.params.id,
      parkSpot: this.state.spot,
      userID: window.userID
    }

    if(this.state.vehicle_number.length < 8 || this.state.vehicle_number.length > 9 || this.state.spot == 0 || this.state.time == 0)
      return;


    var request = new Request('http://172.31.3.30:8080/addRent', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify(data)
    })

    var _this = this;

    fetch(request)
    .then(function(response){
    response.json()
      .then(function(data) {
        if(data.status == 'success')
          _this.getData();
          _this.forceUpdate();
          _this.setState({ time: 0, spot: 0, vehicle_number: "", renderSuccessMessage: true});
      })
    })

  }

  change(e) {
    this.setState({[e.target.name] : e.target.value.toUpperCase()});
  }

  render() {
    return (
      <div className="animated fadeIn">
          <Row>
          <Col xs="12" md="6">
            <Alert isOpen={this.state.renderSuccessMessage == true}>
              Rezervarea ta a fost creata cu succes.
            </Alert>
            <Card>
              <CardHeader>
                <strong>Inchiriere</strong> loc de parcare
              </CardHeader>
              <CardBody>
                <Form encType="multipart/form-data" className="form-horizontal">
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="numar">Numar de inmatriculare</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="numar" name="vehicle_number" ref = "vehicle_number" value={ this.state.vehicle_number } onChange={e => this.change(e)} placeholder="BV 04 BOS" />
                    </Col>
                  </FormGroup> 
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="timp">Perioada inchiriere</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="time" id="timp" bsSize="sm" ref = "time" value={ this.state.time } onChange={e => this.change(e)}>
                        <option value="0">Please select</option>
                        <option value="30">30 de minute</option>
                        <option value="60">1 ora</option>
                        <option value="180">3 ore</option>
                        <option value="360">6 ore</option>
                        <option value="1440">24 ore</option>
                      </Input>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="loc">Loc</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="spot" id="loc" bsSize="sm" dangerouslySetInnerHTML={{__html: this.listAvailableSpots()}} ref = "spot" value={ this.state.spot } onChange={e => this.change(e)}>
                      </Input>
                    </Col>
                  </FormGroup>
                </Form>
              </CardBody>
              <CardFooter>
                <Button type="submit" size="sm" color="primary" onClick={e=>this.submitForm(e)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
              </CardFooter>
            </Card>
          </Col>
          <Col xs="12" md="6">
          <Card>
            <CardHeader>
              <strong>Locuri</strong> deja rezervate
            </CardHeader>
            <CardBody>
                <ul dangerouslySetInnerHTML={{__html: this.listOccupiedSpots()}}></ul>
            </CardBody>
          </Card> 
          </Col>
        <Row></Row></Row>
      </div>

    );
  }
}

export default Rezerva;