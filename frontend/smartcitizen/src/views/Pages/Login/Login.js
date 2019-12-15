import React, { Component } from 'react';
import { Link, Redirect} from 'react-router-dom';
import { Alert, Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';

class Login extends Component {

  state = {
    email: "",
    password: "",
    error: "",
    redirect: false,
    redirectToSignUp: false
  }

  renderRedirect = () => {
    if (this.state.redirect == true) {
      return <Redirect to='/'/>
    }
  }

  change = e =>
  {
      this.setState({[e.target.name]: e.target.value});
  };

  onSubmitSignUp = e => {
    this.props.history.push('/register');
  }

  onSubmit = e => {
    e.preventDefault();

    let data = {
        userEmail: this.state.email,
        userPassword: this.state.password
    }
    
    var request = new Request(process.env.REACT_APP_BACKEND_ADDRESS+'/loginUser' , {
      method: 'POST',
      credentials: 'same-origin',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    })

    var this_ = this;
    fetch(request)
      .then(function(response){
      response.json()
        .then(function(data) {
          this_.setState({error: data});
          if (this_.state.error.type == "success") {            
            
            /*window.LoggedIn = true;
            window.userID = data.userID;*/

            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('userID', data.userID);
            
            this_.setState({redirect : true}); 
          }
        })
      })

    this.setState(
    {
        email: "",
        password: ""
    }
  )
  };
  render() {
    return (
      <div className="app flex-row align-items-center">
       {this.renderRedirect()}
        <Container>
          
          <Row className="justify-content-center">

            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form>
                    <Alert color= {this.state.error.type} isOpen={this.state.error.type != null}>
                        {this.state.error.message}
                </Alert>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="email" autoComplete="email" name = "email" ref = "email" value={ this.state.email } onChange={e=>this.change(e)}/>
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="current-password" name = "password" ref = "password" value={ this.state.password } onChange={e=>this.change(e)} />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4" onClick={e =>this.onSubmit(e)}>Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0">Forgot password?</Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                        <Button color="primary" className="mt-3" active tabIndex={-1} onClick={e =>this.onSubmitSignUp(e)}>Register Now!</Button>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
