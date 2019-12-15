import React, { Component, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Map, GoogleApiWrapper , Marker, InfoWindow} from 'google-maps-react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap';


class InfoWindowEx extends Component {
  constructor(props) {
    super(props);
    this.infoWindowRef = React.createRef();
    this.contentElement = document.createElement(`div`);
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      ReactDOM.render(
        React.Children.only(this.props.children),
        this.contentElement
      );
      this.infoWindowRef.current.infowindow.setContent(this.contentElement);
    }
  }

  render() {
    return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
  }
}

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      totalParkingSpots: 0,
      totalParkingFreeSpots: 0,
      totalParkingLots: 0,
      totalUsers: 0,
      parkingLots: [],
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      userLocation: null
    };

    navigator.geolocation.getCurrentPosition(this.setLocationCallback);
    this.getData();
  }

  setLocationCallback = (location) => {
    this.state.userLocation = location.coords;
  };

  returnLotInfo = (index, propriety) => {
    if(index == undefined || this.state.parkingLots.length == 0) 
      return '';
    return this.state.parkingLots[index][propriety];
  }

  onMarkerClick = (props, marker, e) => {

    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }

  redirectToReserve = e => {
    e.preventDefault();
    this.props.history.push('/rezerva/'+this.state.selectedPlace.name);   
  }

  displayMarkers = () => {
      return this.state.parkingLots.map((parkingLot, index) => {
      return <Marker position = {{
        lat: parkingLot.latitude,
        lng: parkingLot.longitude
      }} onClick = {this.onMarkerClick} name = {index}/>
    })
  }

  getData() {
    var request = new Request('http://172.31.3.30:8080/getStats' , {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })

    var parkingLotsRequest = new Request('http://172.31.3.30:8080/getParkingLots' , {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })

    var this_ = this;
    fetch(request)
      .then(function(response){
      response.json()
        .then(function(data) {
          console.log(data);
          if (data.type == "success") {
              this_.setState ({
                totalParkingFreeSpots: data.data.totalParkingFreeSpots, 
                totalParkingSpots: data.data.totalParkingSpots, 
                totalUsers: data.data.totalUsers, 
                totalParkingLots: data.data.totalParkingLots
              });  
          }
        
        })
      })

      fetch(parkingLotsRequest)
      .then(function(response){
      response.json()
        .then(function(data) {
          if (data.type == "success") {
              this_.setState ({
                parkingLots: data.results
              });  
          }
        })
      })
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {

    return (

      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="6" lg="3">
            <Card className="text-white bg-info">
              <CardBody className="pb-0">
                <div className="text-value">{this.state.totalParkingSpots}</div>
                <div>Locuri de parcare</div>
                <br></br>
              </CardBody>
            </Card>
          </Col>

          <Col xs="12" sm="6" lg="3">
            <Card className="text-white bg-primary">
              <CardBody className="pb-0">
              <div className="text-value">{this.state.totalParkingFreeSpots}</div>
              <div>Locuri de parcare libere</div>
              <br></br>
              </CardBody>
            </Card>
          </Col>

          <Col xs="12" sm="6" lg="3">
            <Card className="text-white bg-warning">
              <CardBody className="pb-0">
                <div className="text-value">{this.state.totalParkingLots}</div>
                <div>Parcari</div>
                <br></br>
              </CardBody>
            </Card>
          </Col>

          <Col xs="12" sm="6" lg="3">
            <Card className="text-white bg-danger">
              <CardBody className="pb-0">
                <div className="text-value">{this.state.totalUsers}</div>
                <div>Utilizatori</div>
                <br></br>
              </CardBody>
            </Card>
          </Col>
        </Row>

      <Row>
      <Col xs="12" lg="12">
        <Card>
        <div id = "mapBox" style = {{ height: '100vh', width: '100%'}}>
                  <Map
                    google={this.props.google}
                    zoom={14}
                    style = {{
                      position: 'relative',
                      width: '100%',
                      height: '100%'
                    }}
                    initialCenter={{ lat: 45.657974, lng: 25.601198}}>
                      {this.displayMarkers()}
                      {(this.state.userLocation != null) ? <Marker position = {{ lat: this.state.userLocation.latitude, lng: this.state.userLocation.longitude }} icon = {'https://img.icons8.com/android/24/000000/car.png'}></Marker> : null}
                      <InfoWindowEx
                      marker={this.state.activeMarker}
                      visible={this.state.showingInfoWindow}>
                        <div>
                          <b>Denumire:</b> {this.returnLotInfo(this.state.selectedPlace.name, 'name')}<br></br>
                          <b>Stare actuala:</b> { this.returnLotInfo(this.state.selectedPlace.name, 'emptySpots') } din {this.returnLotInfo(this.state.selectedPlace.name, 'capacity')} locuri disponibile <br></br>
                          
                          { (this.returnLotInfo(this.state.selectedPlace.name, 'emptySpots')) ? 
                          ( <center>
                          <Col sm xs="12" className="text-center mt-3">
                            <Button onClick={e =>this.redirectToReserve(e)}>
                                <i className="fa fa-lightbulb-o"></i> &nbsp; rezerva
                            </Button> 
                          </Col>
                          </center> ) : null }
                        </div>
                      </InfoWindowEx>
                    </Map>
          </div>
          </Card>
          </Col>
          </Row>
            </div>
    );
  }
}

//export default Dashboard;
export default GoogleApiWrapper({
  apiKey: 'AIzaSyA6FQieeZenDBBEFD2nYVmNj6r-lpMAd4o'
})(Dashboard);
