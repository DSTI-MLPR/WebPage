"use client";
import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GripVertical, ArrowRightLeft, Brain, Trash2 } from "lucide-react"

const availableInputs = [
  { id: "pregnancies", name: "Number of times pregnant", type: "number" },
  { id: "plasmaGlucose", name: "Plasma glucose concentration (2-hour oral glucose tolerance test)", type: "number" },
  { id: "diastolicBP", name: "Diastolic blood pressure (mm Hg)", type: "number" },
  { id: "tricepsThickness", name: "Triceps skin fold thickness (mm)", type: "number" },
  { id: "serumInsulin", name: "2-Hour serum insulin (mu U/ml)", type: "number" },
  { id: "bmi", name: "Body mass index (kg/m²)", type: "number" },
  { id: "diabetesPedigree", name: "Diabetes pedigree function", type: "number" },
  { id: "age", name: "Age (years)", type: "number" },
]

export default function Home() {
  const [inputs, setInputs] = useState({
    available: availableInputs,
    selected: [],
  })
  const [inputValues, setInputValues] = useState({})
  const [prediction, setPrediction] = useState(null)

  const onDragEnd = (result) => {
    const { source, destination } = result
    
    // If there's no destination or if the item is dropped in the same spot, do nothing
    if (!destination) {
      return
    }

    // Only allow drops in 'available' or 'selected' zones
    if (!['available', 'selected'].includes(destination.droppableId)) {
      return
    }

    // If the source and destination are the same and the indices are the same, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceList = [...inputs[source.droppableId]]
    const destList = [...inputs[destination.droppableId]]
    
    // Get the item being moved
    const [itemToMove] = sourceList.splice(source.index, 1)
    
    // Check if the item already exists in the destination list
    const isDuplicate = destList.some(item => item.id === itemToMove.id)
    if (isDuplicate) {
      return
    }
    
    // If not a duplicate, proceed with the move
    destList.splice(destination.index, 0, itemToMove)

    setInputs({
      ...inputs,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    })
  }

  const handleInputChange = (id, value) => {
    setInputValues({ ...inputValues, [id]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputValues),
    })
    const data = await response.json()
    setPrediction(data.prediction)
  }

  const removeInput = (id) => {
    const removedInput = inputs.selected.find((input) => input.id === id)
    if (removedInput) {
      setInputs({
        available: [...inputs.available, removedInput],
        selected: inputs.selected.filter((input) => input.id !== id),
      })
      const newInputValues = { ...inputValues }
      delete newInputValues[id]
      setInputValues(newInputValues)
    }
  }

  return (
    (<div
      className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 py-8">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">Predicting Diabetes Outcome for Women</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <Droppable droppableId="available" isDropDisabled={false}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-50 p-4 rounded-md flex-1">
                    <h2 className="font-semibold mb-4 text-lg flex items-center">
                      <ArrowRightLeft className="mr-2" />
                      Available Inputs
                    </h2>
                    {inputs.available.map((input, index) => (
                      <Draggable key={input.id} draggableId={input.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 mb-2 rounded shadow-sm border border-gray-200 flex items-center">
                            <GripVertical className="mr-2 text-gray-400" size={16} />
                            {input.name}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <Droppable droppableId="selected" isDropDisabled={false}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-50 p-4 rounded-md flex-1">
                    <h2 className="font-semibold mb-4 text-lg flex items-center">
                      <Brain className="mr-2" />
                      Selected Inputs
                    </h2>
                    {inputs.selected.map((input, index) => (
                      <Draggable key={input.id} draggableId={input.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white p-3 mb-2 rounded shadow-sm border border-gray-200">
                            <div className="flex items-center mb-2" {...provided.dragHandleProps}>
                              <GripVertical className="mr-2 text-gray-400" size={16} />
                              <Label htmlFor={input.id} className="flex-grow">
                                {input.name}
                              </Label>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInput(input.id)}
                                className="h-8 w-8">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                            <Input
                              id={input.id}
                              type={input.type}
                              value={inputValues[input.id] || ""}
                              onChange={(e) => handleInputChange(input.id, e.target.value)}
                              className="w-full" />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button
              type="submit"
              disabled={inputs.selected.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Get Prediction
            </Button>
          </form>
        </div>
        {prediction && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-indigo-800">Prediction Result:</h2>
            <p className="text-gray-700">{prediction}</p>
          </div>
        )}
      </div>
    </div>)
  );
}

