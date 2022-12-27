class Assert
{
	static areEqual(expected, actual)
	{
		if (actual != expected)
		{
			throw new Error("Expected: '" + expected + "', but was: '" + actual + "'.");
		}
	}

	static areNotEqual(expected, actual)
	{
		if (actual == expected)
		{
			throw new Error("Expected: not equal, but was: equal.");
		}
	}

	static fail(message)
	{
		throw new Error(message);
	}

	static isFalse(expressionToTest)
	{
		if (expressionToTest == true)
		{
			throw new Error("Expected: false, but was: true.");
		}
	}

	static isNotNull(expressionToTest)
	{
		if (expressionToTest == null)
		{
			throw new Error("Expected: not null, but was: null.");
		}
	}

	static isNull(expressionToTest)
	{
		if (expressionToTest != null)
		{
			throw new Error("Expected: null, but was: not null.");
		}
	}

	static isTrue(expressionToTest)
	{
		if (expressionToTest == false)
		{
			throw new Error("Expected: true, but was: false.");
		}
	}

	static throwsException(lambdaToRun)
	{
		var didThrowException;

		try
		{
			lambdaToRun();
			didThrowException = false;
		}
		catch (ex)
		{
			didThrowException = true;
		}
		
		if (didThrowException == false)
		{
			throw new Error("Expected exception, but none was thrown.");
		}
	}
}

class Test
{
	constructor(name, run)
	{
		this.name = name;
		this._run = run;
	}

	run()
	{
		this._run();
	}
}

class TestSuite
{
	constructor(tests)
	{
		this.tests = tests;
	}

	run()
	{
		var testsCount = this.tests.length;
		var testsPassedSoFarCount = 0;
		var newline = "<br />";

		for (var i = 0; i < testsCount; i++)
		{
			var test = this.tests[i];
			try
			{
				test.run();
				testsPassedSoFarCount++;
				document.write("Test passed: " + test.name + newline);
			}
			catch (ex)
			{
				document.write("Test '" + test.name + "' failed with error:");
				document.write(newline);
				document.write(ex.stack);
				document.write(newline);

				throw ex;
			}
		}

		document.write(newline);

		var testsFailedCount = testsCount - testsPassedSoFarCount;

		if (testsFailedCount == 0)
		{
			document.write("All " + testsCount + " test(s) passed!");
		}
		else
		{
			document.write("Tests failed: " + testsFailedCount + "/" + testsCount);
		}
	}
}
