import React, { Component } from 'react';
import {Alert, Table} from 'reactstrap';

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
  Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';

var globalThis = null;

class Rezerva extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      parkingLotInfo: {},
      vehicle_number: "",
      spot: 0,
      time: 0,
      renderSuccessMessage: false,
      modal: false,
    }

    globalThis = this;

    if(sessionStorage.getItem('loggedIn') !== 'true')
      return this.props.history.push('/login');

    this.toggleModal = this.toggleModal.bind(this);

    this.getData();    
  }

  toggleModal() {
    globalThis.setState({modal: !globalThis.state.modal});
  }

  getData() {
    var request = new Request(process.env.REACT_APP_BACKEND_ADDRESS+'/getParkingLotInformation/'+this.props.match.params.id, {
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
      if(this.state.parkingLotInfo.Spots[i].occupied) {
        htmlCode += `<tr><td><center>${i}</center></td><td><center>${this.state.parkingLotInfo.Spots[i].vehicle_number}</center></td><td><center>${new Date(this.state.parkingLotInfo.Spots[i].expire_time).toISOString().slice(0, 19).replace('T', ' ')}</center></td></tr>`;
      }
    return htmlCode;
  }

  submitForm(e) {
    e.preventDefault();

    if(globalThis.state.vehicle_number.length < 8 || globalThis.state.vehicle_number.length > 9 || globalThis.state.spot == 0 || globalThis.state.time == 0)
      return;

    if(globalThis.state.vehicle_number.match(/^[A-Z]{2} [0-9]{2,3} [A-Z]{2}/g) == null)
      return;  

    this.setState({ modal: true });
  }

  doWebRequest() {
    
    let data = 
    {
      vehicleNumber: globalThis.state.vehicle_number,
      Time: globalThis.state.time,
      parkLot: globalThis.props.match.params.id,
      parkSpot: globalThis.state.spot,
      userID: sessionStorage.getItem('userID')
    }

    var request = new Request(process.env.REACT_APP_BACKEND_ADDRESS+'/addRent', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify(data)
    })

    fetch(request)
    .then(function(response){
    response.json()
      .then(function(data) {
        if(data.status == 'success')
          globalThis.getData();
          globalThis.forceUpdate();
          globalThis.setState({ modal: false, time: 0, spot: 0, vehicle_number: "", renderSuccessMessage: true});
      })
    })
  }

  change(e) {
    this.setState({[e.target.name] : e.target.value.toUpperCase()});
  }

  render() {
    return (

      <div className="animated fadeIn">
          <Modal isOpen={this.state.modal} toggle = {this.toggleModal} className={'modal-lg'}>
            <ModalHeader toggle={this.toggleModal}> Factura loc parcare { this.props.spot }</ModalHeader>
            <ModalBody>
            <div className={"card-body"}>
              <div className={'row'}>
                <div className={'col-md-8'}>
                  <div className={'table-responsive-sm'}><table className={'table table-striped'}><thead><tr><th className={'center'}>#</th><th>Item</th><th>Loc parcare</th><th className={'center'}>Timp</th><th className={'right'}>Cost per minut</th><th className={'right'}>Total</th></tr></thead><tbody><tr><td className={'center'}>1</td><td className={'left'}>Inchiriere loc parcare</td><td className={'left'}>Loc { this.state.spot }</td><td className={'center'}>{ this.state.time } minute</td><td className={'right'}>0.10 RON</td><td className={'right'}>{ this.state.time*0.10 } RON</td></tr></tbody></table></div>    
                </div>
              <div className={"col-md-4"}>
              <table className={"table table-clear"}>
              <tbody>
                <tr>
                  <td className={"left"}>
                    <strong>VAT (10%)</strong>
                  </td>
                  <td className={"right"}>{(0.2 * 0.10 * this.state.time).toFixed(2)} RON</td>
                </tr>
                <tr>
                  <td className={'left'}>
                    <strong>Total</strong>
                  </td>
                  <td className={'right'}>
                    <strong>{0.10 * this.state.time} RON</strong>
                  </td>
                </tr>
              </tbody>
              </table>
              </div>
          </div></div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.doWebRequest}>Plateste</Button>{' '}
              <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
            </ModalFooter>
          </Modal>
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
                      <Input type="text" id="numar" name="vehicle_number" ref = "vehicle_number" value={ this.state.vehicle_number } onChange={e => this.change(e)} placeholder="BV 01 ABC" />
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
                <Button type="submit" size="sm" color="primary" onClick={e=>this.submitForm(e)}><i className="fa fa-dot-circle-o"></i> Inchiriaza</Button>
              </CardFooter>
            </Card>
          </Col>
          <Col xs="12" md="6">
          <Card>
            <CardHeader>
              <strong>Locuri</strong> deja rezervate
            </CardHeader>
            <CardBody>
            <Table responsive striped>
                <thead>
                  <tr>
                    <th><center>Loc parcare</center></th>
                    <th><center>Numar de inmatriculare</center></th>
                    <th><center>Expira la</center></th>
                  </tr>
                </thead>
                <tbody dangerouslySetInnerHTML={{__html: this.listOccupiedSpots()}}></tbody>
            </Table>    
            </CardBody>
          </Card> 
          </Col>
        <Row></Row></Row>
      </div>

    );
  }
}

export default Rezerva;