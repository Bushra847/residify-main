
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Code, FileText } from 'lucide-react';

interface EndpointProps {
  endpoint: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    title: string;
    description: string;
    category: string;
    requestBody?: {
      contentType: string;
      schema: any;
    };
    queryParams?: Array<{
      name: string;
      required: boolean;
      description: string;
      type: string;
    }>;
    responses: {
      [key: string]: {
        description: string;
        content?: any;
      };
    };
  };
}

const ApiEndpointCard = ({ endpoint }: EndpointProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500 text-white';
      case 'POST':
        return 'bg-blue-500 text-white';
      case 'PUT':
        return 'bg-yellow-500 text-white';
      case 'DELETE':
        return 'bg-red-500 text-white';
      case 'PATCH':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-gray-50 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-3">
          <Badge className={`${getMethodColor(endpoint.method)} font-mono`}>
            {endpoint.method}
          </Badge>
          <span className="font-mono text-sm md:text-base">{endpoint.path}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-4 text-sm text-muted-foreground hidden md:inline">
            {endpoint.title}
          </span>
          <Button variant="ghost" size="icon">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 border-t">
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-1">{endpoint.title}</h3>
            <p className="text-muted-foreground">{endpoint.description}</p>
          </div>
          
          {endpoint.queryParams && endpoint.queryParams.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <FileText size={16} className="mr-2" />
                Query Parameters
              </h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium text-gray-500 pb-2">Name</th>
                      <th className="text-left font-medium text-gray-500 pb-2">Required</th>
                      <th className="text-left font-medium text-gray-500 pb-2">Type</th>
                      <th className="text-left font-medium text-gray-500 pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.queryParams.map((param, i) => (
                      <tr key={i}>
                        <td className="pr-4 py-1 font-mono">{param.name}</td>
                        <td className="pr-4 py-1">{param.required ? 'Yes' : 'No'}</td>
                        <td className="pr-4 py-1 font-mono">{param.type}</td>
                        <td className="py-1">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {endpoint.requestBody && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <Code size={16} className="mr-2" />
                Request Body
              </h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Content Type:</span> 
                  <span className="font-mono text-xs ml-1">{endpoint.requestBody.contentType}</span>
                </div>
                <pre className="text-xs bg-black text-green-400 p-3 rounded overflow-x-auto">
                  {JSON.stringify(endpoint.requestBody.schema, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <FileText size={16} className="mr-2" />
              Responses
            </h4>
            <div className="space-y-3">
              {Object.entries(endpoint.responses).map(([code, response], i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between mb-2">
                    <Badge className={code.startsWith('2') ? 'bg-green-500' : 'bg-red-500'}>
                      {code}
                    </Badge>
                    <span className="text-xs text-gray-500">{response.description}</span>
                  </div>
                  {response.content && (
                    <pre className="text-xs bg-black text-green-400 p-3 rounded overflow-x-auto">
                      {JSON.stringify(response.content, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ApiEndpointCard;
