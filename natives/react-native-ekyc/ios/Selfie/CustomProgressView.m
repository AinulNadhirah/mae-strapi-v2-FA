//
//  CustomProgressView.m
//  CustomProgressView
//
//  Created by Mariya Kholod on 6/18/13.
//  Copyright (c) 2013 Mariya Kholod. All rights reserved.
//

#import "CustomProgressView.h"

@implementation CustomProgressView

@synthesize current_value;
@synthesize delegate;

- (id)initWithFrame:(CGRect)value
{
    CGRect frame;
    if ([[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeLeft || [[UIApplication sharedApplication] statusBarOrientation] == UIDeviceOrientationLandscapeRight)
        frame = CGRectMake(value.origin.x, value.origin.y, value.size.width, value.size.height);
    else
        frame = CGRectMake(value.origin.x, value.origin.y, value.size.width, value.size.height);
    
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        current_value = 0.0;
        new_to_value = 0.0;
        IsAnimationInProgress = NO;
        
        self.alpha = 1.0;
        self.backgroundColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.0];
        self.autoresizingMask = UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin | UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin;
        
        ProgressLbl = [[UILabel alloc] initWithFrame:CGRectMake((self.frame.size.width-200)/2, self.frame.size.height/2-150, 200, 0.0)];
        ProgressLbl.font = [UIFont boldSystemFontOfSize:24.0];
        ProgressLbl.text = @"0%";
        ProgressLbl.backgroundColor = [UIColor clearColor];
        ProgressLbl.textColor = [UIColor whiteColor];
        ProgressLbl.textAlignment = NSTextAlignmentCenter ;
        ProgressLbl.alpha = self.alpha;
        [self addSubview:ProgressLbl];
    }
    return self;
}

-(void)UpdateLabelsWithValue:(NSString*)value
{
    ProgressLbl.text = value;
}

-(void)setProgressValue:(float)to_value withAnimationTime:(float)animation_time
{
    float timer = 0;
    
    float step = 0.1;
    
    float value_step = (to_value-self.current_value)*step/animation_time;
    int final_value = self.current_value*100;
    
    while (timer<animation_time-step) {
        final_value += floor(value_step*100);
        [self performSelector:@selector(UpdateLabelsWithValue:) withObject:[NSString stringWithFormat:@"%i%%", final_value] afterDelay:timer];
        timer += step;
    }
    
    [self performSelector:@selector(UpdateLabelsWithValue:) withObject:[NSString stringWithFormat:@"%.0f%%", to_value*100] afterDelay:animation_time];
}

-(void)SetAnimationDone
{
    IsAnimationInProgress = NO;
    if (new_to_value>self.current_value)
        [self setProgress:[NSNumber numberWithFloat:new_to_value] width:[NSNumber numberWithFloat:200.0] timer:[NSNumber numberWithFloat:5.0]];
}

- (void)setProgress:(NSNumber*)value width:(NSNumber *)radVal timer:(NSNumber*)timerValue{
    
    float to_value = [value floatValue];
    
    if (to_value<=self.current_value)
        return;
    else if (to_value>1.0)
        to_value = 1.0;
    
    if (IsAnimationInProgress)
    {
        new_to_value = to_value;
        return;
    }
    
    IsAnimationInProgress = YES;
    
    float animation_time = to_value-self.current_value;
    
    [self performSelector:@selector(SetAnimationDone) withObject:Nil afterDelay:10.0];
    
    if (to_value == 1.0 && delegate && [delegate respondsToSelector:@selector(didFinishAnimation:)])
        [delegate performSelector:@selector(didFinishAnimation:) withObject:self afterDelay:animation_time];
    
    [self setProgressValue:to_value withAnimationTime:animation_time];
    
    float start_angle = 2*M_PI*self.current_value-M_PI_2;
    float end_angle = 2*M_PI*to_value-M_PI_2;
    
    float radius = [radVal floatValue];
    
    CAShapeLayer *circle = [CAShapeLayer layer];
    
    // Make a circular shape
    
    circle.path = [UIBezierPath bezierPathWithArcCenter:CGPointMake(self.frame.size.width/2,self.frame.size.height/2)
                                                 radius:radius startAngle:start_angle endAngle:end_angle clockwise:YES].CGPath;
    
    // Configure the apperence of the circle
    circle.fillColor = [UIColor clearColor].CGColor;
//    circle.strokeColor = [UIColor yellowColor].CGColor;
    circle.strokeColor = [UIColor colorWithRed:255.0/255.0 green:188.0/255.0 blue:0/255.0 alpha:1].CGColor;
    
    
    // Add to parent layer
    [self.layer addSublayer:circle];
    
    // Configure animation
    CABasicAnimation *drawAnimation = [CABasicAnimation animationWithKeyPath:@"strokeEnd"];
    if([timerValue floatValue] == 10.0) {
        drawAnimation.duration            = 10.0;
        circle.lineWidth = 3;
    }else {
        drawAnimation.duration            = 5.0;
        circle.lineWidth = 4;
    }
    
    drawAnimation.repeatCount         = 0.0;  // Animate only once..
    drawAnimation.removedOnCompletion = NO;   // Remain stroked after the animation..
    
    // Animate from no part of the stroke being drawn to the entire stroke being drawn
    drawAnimation.fromValue = [NSNumber numberWithFloat:0.0];
    drawAnimation.toValue   = [NSNumber numberWithFloat:1.0];
    
    // Experiment with timing to get the appearence to look the way you want
    drawAnimation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn];
    
    // Add the animation to the circle
    [circle addAnimation:drawAnimation forKey:@"drawCircleAnimation"];
    self.current_value = to_value;
}

@end
