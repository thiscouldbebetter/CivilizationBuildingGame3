
class Camera
{
	viewSizeInPixels: Coords;
	focalLength: number;
	loc: Disposition;

	constructor
	(
		viewSizeInPixels: Coords,
		focalLength: number,
		loc: Disposition
	)
	{
		this.viewSizeInPixels = viewSizeInPixels;
		this.focalLength = focalLength;
		this.loc = loc;

		this.viewSizeInPixelsHalf =
			this.viewSizeInPixels.clone().half();
	}

	static default(): Camera
	{
		var viewWidthInPixels = 480;

		return new Camera
		(
			Coords.ones().multiplyScalar(viewWidthInPixels), // viewSize
			null, // focalLength
			new Disposition
			(
				Coords.zeroes(), // pos
				Orientation.forwardZDownY()
			)
		);
	}

	coordsTransformFromWorldToView(coordsToTransform: Coords): Coords
	{
		var ori = this.loc.ori;

		// Get position relative to camera.
		coordsToTransform.subtract
		(
			this.loc.pos
		);

		// Project along camera axes.
		coordsToTransform.overwriteWithDimensions
		(
			coordsToTransform.dotProduct(ori.right),
			coordsToTransform.dotProduct(ori.down),
			coordsToTransform.dotProduct(ori.forward),
		);

		if (this.focalLength != null)
		{
			// Things further away appear closer
			// to the central vanishing point.

			var z = coordsToTransform.z;
			coordsToTransform.multiplyScalar
			(
				this.focalLength
			).divideScalar
			(
				z
			);
			coordsToTransform.z = z;
		}

		return coordsToTransform;
	}

	viewCornersClockwiseFromLowerRight(): Coords[]
	{
		var ori = this.loc.ori;
		var viewCenter =
			ori.forward.clone().multiplyScalar
			(
				focalLength
			).add
			(
				this.loc.pos
			);

		var offsetFromCenterToEdgeRight =
			ori.right.clone().multiplyScalar
			(
				this.viewSizeHalf.x
			);

		var offsetFromCenterToEdgeLower =
			ori.down.clone().multiplyScalar
			(
				this.viewSizeHalf.y
			);

		var cornerPositionsClockwiseFromLowerRight =
		[
			viewCenter.clone().add
			(
				offsetFromCenterToEdgeRight
			).add
			(
				offsetFromCenterToEdgeLower
			),

			viewCenter.clone().subtract
			(
				offsetFromCenterToEdgeRight
			).add
			(
				offsetFromCenterToEdgeLower
			),

			viewCenter.clone().subtract
			(
				offsetFromCenterToEdgeRight
			).subtract
			(
				offsetFromCenterToEdgeLower
			),

			viewCenter.clone().add
			(
				offsetFromCenterToEdgeRight
			).subtract
			(
				offsetFromCenterToEdgeLower
			),
		];

		return cornerPositionsClockwiseFromLowerRight;
	}
}