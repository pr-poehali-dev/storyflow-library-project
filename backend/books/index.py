import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для работы с книгами: получение списка, добавление, чтение'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            book_id = event.get('queryStringParameters', {}).get('id')
            
            if book_id:
                cursor.execute('SELECT * FROM books WHERE id = %s', (book_id,))
                book = cursor.fetchone()
                
                if book:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(dict(book), ensure_ascii=False, default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Книга не найдена'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
            else:
                cursor.execute('SELECT id, title, author, genre, year, description, cover_url FROM books ORDER BY created_at DESC')
                books = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(book) for book in books], ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            title = body.get('title', '').strip()
            author = body.get('author', '').strip()
            genre = body.get('genre', '').strip()
            year = body.get('year')
            description = body.get('description', '').strip()
            content = body.get('content', '').strip()
            cover_url = body.get('cover_url', '').strip()
            
            if not title or not author or not content:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Необходимо заполнить название, автора и текст книги'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                '''INSERT INTO books (title, author, genre, year, description, content, cover_url) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
                (title, author, genre or 'Без жанра', year, description, content, cover_url)
            )
            
            book_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': book_id, 'message': 'Книга успешно добавлена'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
