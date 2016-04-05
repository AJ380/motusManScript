/*
// Controller System for Player 
// Walker Boys (www.walkerboystudio.com)
// November 28, 2011
// Description: Controls all character (player) actions for movement / interactions
// Instruction: Assign script to main character (gameObject). Also, assign a characterController to the component
// Function arguments: Lots. :) Be sure to go through them. 
// Main variables to use are below:
// moveDirection   = player forward direction
// targetDirection = camera forward direction
// inAirVelocity   = speed of player (mainly for jumps)
*/
var rotateOffset : float = 0.0;

var cameraObject					: Camera;										// player camera  (usually main camera)


var speedInAir						: float				= 1.0;						// var inAirControlAcceleration
var gravity							: float				= 20.0;						// gravity (downward pull only, added to vector.y) 
private var inAirVelocity			: Vector3			= Vector3.zero;				// current currentSpeed while in air 
private var verticalSpeed			: float				= 0.0;						// speed for vertical use
private var collisionFlags			: CollisionFlags;								// last collision flag returned from control move

@HideInInspector																	// hide characterController in the inspector but keep public - for now
var characterController 			: CharacterController;							// instance of character controller
@HideInInspector 

static var moveSpeed				: float 			= 0.0;						// current player moving speed
private var moveDirection			: Vector3			= Vector3.forward;				// store initial forward direction of player
private var smoothDirection			: float 			= 10.0;						// amount to smooth camera catching up to player

var timeVal : float = 0;
var anim : Animator;

@script RequireComponent ( CharacterController )									// if no characterController assigned, apply one -later

////////////////////////////////////////////////////////////////////
function Start 					() {		
	
    // initialize variables
    characterController = GetComponent ( CharacterController );						// initialize characterController
    characterController.tag = "Player";												// set tag name to 'Player'	
}


////////////////////////////////////////////////////////////////////
function UpdateMoveDirection 	() {												// motor, ani, and direction of player			
    var forward : Vector3 = cameraObject.transform.TransformDirection ( Vector3.forward );	// forward vector relative to the camera along the x-z plane
    forward.y = 0;																	// up/down is set to 0
    forward = forward.normalized;													// set forward between 0-1	
    var right : Vector3 = Vector3( forward.z, 0, -forward.x );						// right vector relative to the camera, always orthogonal to the forward vector


        var vertical : float   = Input.GetAxisRaw ( "Vertical"   );						// get input vertical
        var horizontal : float = Input.GetAxisRaw ( "Horizontal" );						// get input horizontal


    if (vertical == 0.0 && horizontal == 0.0)
    {
        timeVal = 0;
        moveSpeed = 0.0;
    }
    else
    {
        timeVal += Time.deltaTime*3;
        moveSpeed = 1.0 * timeVal;	
    }
    var targetDirection : Vector3 = horizontal * right + vertical * forward;		// target direction relative to the camera

    if ( IsGrounded () )															// if player on ground
    {
        if ( targetDirection != Vector3.zero )										// store currentSpeed and direction separately
        {
            moveDirection = Vector3.Lerp ( moveDirection, targetDirection, smoothDirection * Time.deltaTime );	// smooth camera follow player direction
            moveDirection = moveDirection.normalized;								// normalize (set to 0-1 value)
        }	
		
        Idle   			();															// check for player idle 
        Walk   			();															// check for player walking
    }
    else																			// if player is in air 
    {										
        inAirVelocity += targetDirection.normalized * Time.deltaTime * speedInAir;	// if in air, move player down based on velocity, direction, time and speed
    }
}
		
////////////////////////////////////////////////////////////////////
function Update 				() {												// loop for controller	
    SetGravity ();																// pulls character to the ground 'if' in air
    // pulls character to the ground 'if' in air
    UpdateMoveDirection ();														// motor, direction and ani for player movement
    //moves mario.				
    var movement : Vector3 = moveDirection * moveSpeed + Vector3 ( 0, verticalSpeed, 0 ) + inAirVelocity; // stores direction with speed (h,v)
    movement *= Time.deltaTime;													// set movement to delta time for consistent speed

    //moves mario.				
    collisionFlags = characterController.Move ( movement );						// move the character controller	
		
    if ( IsGrounded () ) 														// character is on the ground (set rotation, translation, direction, speed)
    {
        //orients mario to the direction he is moving.		
        transform.rotation = Quaternion.LookRotation ( moveDirection );			// set rotation to the moveDirection
        transform.rotation.eulerAngles.y += rotateOffset;
			
        inAirVelocity = Vector3(0,-0.1,0);										// turn off check on velocity, set to zero/// current set to -.1 because zero won't keep him on isGrounded true. goes back and forth			
        if ( moveSpeed < 0.15 ) 												// quick check on movespeed and turn it off (0), if it's
        {
            moveSpeed = 0;														// less than .15
        }
    }

}
	
////////////////////////////////////////////////////////////////////
function Idle 					() {												// idles player
    anim.SetFloat("Speed",moveSpeed);
}
////////////////////////////////////////////////////////////////////
function Walk 					() {												// walks player
}

////////////////////////////////////////////////////////////////////
function IsGrounded 			() {												// check if player is touching the ground or a collision flag
    return ( collisionFlags & CollisionFlags.CollidedBelow ) != 0;					// if isGround not equal to 0 if it doesn't equal 0
}
////////////////////////////////////////////////////////////////////
function SetGravity				() {												// sets gravity to 0 for ground and subtracts if in air
    if ( IsGrounded () )
        verticalSpeed = 0.0;														// stop subtracting, if player on ground set to 0
    else
        verticalSpeed -= gravity * Time.deltaTime;									// if character in air, begin moving downward
}
	
